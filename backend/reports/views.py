from datetime import timedelta

from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Q, F, Case, When, Avg, FloatField, DurationField
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from tickets.models import Ticket
from celery.result import AsyncResult
from .tasks import generate_csv_report, generate_pdf_report


class TicketVolumeReport(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            group_by = request.query_params.get('group_by', 'status')  # status, priority, category, assigned_group
            period = request.query_params.get('period', 'day')  # day, week, month

            # Validate group_by parameter
            valid_group_by_fields = ['status', 'priority', 'category', 'assigned_group']
            if group_by != 'none' and group_by not in valid_group_by_fields:
                return Response(
                    {'error': f'Invalid group_by parameter. Must be one of: none, {", ".join(valid_group_by_fields)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate period parameter
            valid_periods = ['day', 'week', 'month']
            if period not in valid_periods:
                return Response(
                    {'error': f'Invalid period parameter. Must be one of: {", ".join(valid_periods)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

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
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class SLAComplianceReport(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            group_by = request.query_params.get('group_by', 'priority')  # priority, category, assigned_group

            # Validate group_by parameter
            valid_group_by_fields = ['priority', 'category', 'assigned_group']
            if group_by not in valid_group_by_fields:
                return Response(
                    {'error': f'Invalid group_by parameter. Must be one of: {", ".join(valid_group_by_fields)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            queryset = Ticket.objects.filter(status='resolved')
            if start_date:
                queryset = queryset.filter(resolved_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(resolved_at__lte=end_date)

            data = queryset.values(group_by).annotate(
                total=Count('id'),
                sla_met_count=Count('id', filter=Q(resolved_at__lte=F('sla_resolution_due'))),
            ).order_by(group_by)

            # Calculate percentage in Python to avoid SQLite FloatField issues
            result = []
            for item in data:
                total = item['total']
                sla_met = item['sla_met_count']
                percentage = (sla_met / total * 100) if total > 0 else 0.0
                item['sla_percentage'] = round(percentage, 2)
                result.append(item)

            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AgentPerformanceReport(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            queryset = Ticket.objects.filter(assigned_to__isnull=False)
            if start_date:
                queryset = queryset.filter(created_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(created_at__lte=end_date)

            # Get data without FloatField
            data = queryset.values(agent_username=F('assigned_to__username')).annotate(           
                assigned_count=Count('id'),           
                resolved_count=Count('id', filter=Q(status='resolved')),          
                avg_duration=Avg(               
                    Case(                        
                        When(status='resolved', then=F('resolved_at') - F('created_at')),                        
                        output_field=DurationField()                    
                    )               
                )           
            ).order_by('-assigned_count')

            # Calculate avg_resolution_days in Python
            result = []
            for item in data:
                avg_duration = item.get('avg_duration')
                if avg_duration:
                    avg_days = avg_duration.total_seconds() / (24 * 3600)
                    item['avg_resolution_days'] = round(avg_days, 2)
                else:
                    item['avg_resolution_days'] = 0.0
                result.append(item)

            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ExportReport(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            format_type = request.data.get('format', 'csv')  # csv or pdf
            start_date = request.data.get('start_date')
            end_date = request.data.get('end_date')
            report_type = request.data.get('report_type', 'volume')

            # Validate format
            valid_formats = ['csv', 'pdf']
            if format_type not in valid_formats:
                return Response(
                    {'error': f'Invalid format. Must be one of: {", ".join(valid_formats)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate report_type
            valid_report_types = ['volume', 'sla', 'performance']
            if report_type not in valid_report_types:
                return Response(
                    {'error': f'Invalid report_type. Must be one of: {", ".join(valid_report_types)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if format_type == 'csv':
                task = generate_csv_report.delay(start_date, end_date, report_type)
            elif format_type == 'pdf':
                task = generate_pdf_report.delay(start_date, end_date, report_type)

            return Response({'task_id': task.id})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ExportStatus(APIView):
    def get(self, request, task_id):
        try:
            task = AsyncResult(task_id)
            if task.state == 'SUCCESS':
                return Response({'status': task.state, 'result': task.result.decode() if isinstance(task.result, bytes) else task.result})
            else:
                return Response({'status': task.state, 'info': task.info})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

