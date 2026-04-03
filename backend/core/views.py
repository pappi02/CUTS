from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import School, Department, Category, AssignmentGroup
from .serializers import SchoolSerializer, DepartmentSerializer, CategorySerializer, AssignmentGroupSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db import connection
from tickets.models import Ticket
from accounts.models import CustomUser

class SchoolListView(generics.ListAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]

class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    pagination_class = None
    permission_classes = [IsAuthenticatedOrReadOnly]

class CategoryTreeView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return Category.objects.filter(is_active=True, parent__isnull=True)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

class AssignmentGroupViewSet(viewsets.ModelViewSet):
    queryset = AssignmentGroup.objects.all()
    serializer_class = AssignmentGroupSerializer
    permission_classes = [IsAuthenticated]


class AdminHealthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Check database connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            
            # Check if we have basic data
            user_count = CustomUser.objects.count()
            ticket_count = Ticket.objects.count()
            
            return Response({
                'status': 'healthy',
                'database': 'connected',
                'users': user_count,
                'tickets': ticket_count,
                'timestamp': '2024-01-01T00:00:00Z'  # Mock timestamp
            })
        except Exception as e:
            return Response({
                'status': 'unhealthy',
                'error': str(e)
            }, status=500)


class AdminMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Basic metrics
            total_tickets = Ticket.objects.count()
            open_tickets = Ticket.objects.filter(status__in=['open', 'in_progress']).count()
            resolved_tickets = Ticket.objects.filter(status='resolved').count()
            total_users = CustomUser.objects.count()
            
            return Response({
                'total_tickets': total_tickets,
                'open_tickets': open_tickets,
                'resolved_tickets': resolved_tickets,
                'total_users': total_users,
                'ticket_resolution_rate': round((resolved_tickets / total_tickets * 100) if total_tickets > 0 else 0, 2)
            })
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=500)
