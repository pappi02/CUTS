from datetime import timedelta

from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Q, F, Case, When, Avg, FloatField
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from tickets.models import Ticket
from celery.result import AsyncResult
from .tasks import generate_csv_report, generate_pdf_report


class TicketVolumeReport(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        group_by = request.query_params.get('group_by', 'status')  # status, priority, category, assigned_group
        period = request.query_params.get('period', 'day')  # day, week, month

        queryset = Ticket.objects.all()

        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        if period == 'day':
            trunc_func = TruncDay('created_at')
        elif period == 'week':
            trunc_func = TruncWeek('created_at')
        elif period == 'month':
            trunc_func = TruncMonth('created_at')
        else:
            trunc_func = TruncDay('created_at')

        if group_by == 'none':
            data = queryset.annotate(period=trunc_func).values('period').annotate(count=Count('id')).order_by('period')
        else:
            data = queryset.annotate(period=trunc_func).values('period', group_by).annotate(count=Count('id')).order_by('period', group_by)

        return Response(data)


class SLAComplianceReport(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        group_by = request.query_params.get('group_by', 'priority')  # priority, category, assigned_group

        queryset = Ticket.objects.filter(status='resolved')
        if start_date:
            queryset = queryset.filter(resolved_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(resolved_at__lte=end_date)

        data = queryset.values(group_by).annotate(
            total=Count('id'),
            sla_met_count=Count('id', filter=Q(resolved_at__lte=F('sla_resolution_due'))),
        ).annotate(
            sla_percentage=Case(
                When(total__gt=0, then=FloatField(100.0 * F('sla_met_count') / F('total'))),
                default=0.0,
                output_field=FloatField()
            )
        ).order_by(group_by)

        return Response(list(data))


class AgentPerformanceReport(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        queryset = Ticket.objects.filter(assigned_to__isnull=False)
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        # Simple counts, avg resolution days (epoch seconds / 86400)
        from django.db.models import DurationField, ExpressionWrapper      
        from django.db.models.functions import Extract      
        data = queryset.values(agent_username=F('assigned_to__username')).annotate(           
            assigned_count=Count('id'),           
            resolved_count=Count('id', filter=Q(status='resolved')),          
            duration_days=Avg(               
            ExpressionWrapper(                    
            Case(                        
                 When(status='resolved', then=F('resolved_at') - F('created_at')),                        
                 output_field=DurationField()                    
                 ),                    
                 output_field=DurationField()               
                 )           
                 ),        
                 ).annotate(           
                            avg_resolution_days=models.ExpressionWrapper(                
                            models.F('duration_days') / timedelta(days=1),               
                            output_field=models.FloatField()           
                            )        
                            ).order_by('-assigned_count')

        # Convert None avg to 0        
        # for item in data:            
        # if item.get('avg_resolution_days') is None:                
        # item['avg_resolution_days'] = 0

        return Response(list(data))


class ExportReport(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        format_type = request.data.get('format', 'csv')  # csv or pdf
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        report_type = request.data.get('report_type', 'volume')

        if format_type == 'csv':
            task = generate_csv_report.delay(start_date, end_date, report_type)
        elif format_type == 'pdf':
            task = generate_pdf_report.delay(start_date, end_date, report_type)
        else:
            return Response({'error': 'Invalid format'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'task_id': task.id})


class ExportStatus(APIView):
    def get(self, request, task_id):
        task = AsyncResult(task_id)
        if task.state == 'SUCCESS':
            return Response({'status': task.state, 'result': task.result.decode() if isinstance(task.result, bytes) else task.result})
        else:
            return Response({'status': task.state, 'info': task.info})

