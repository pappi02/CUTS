from django.db import models
from django.utils import timezone
from rest_framework import viewsets, status, filters, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Ticket, TicketComment, Attachment
from .serializers import (
    TicketListSerializer, TicketDetailSerializer,
    TicketCreateSerializer, TicketCommentSerializer, AttachmentSerializer
)
from .filters import TicketFilter
from .permissions import IsAssignedOrAdmin
from django.db.models import Count, Q, F
from accounts.models import CustomUser
from core.models import AssignmentGroup


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TicketFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return TicketListSerializer
        elif self.action == 'create':
            return TicketCreateSerializer
        return TicketDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.select_related(
            'requester', 'assigned_to', 'assigned_group', 'category'
        ).prefetch_related('comments', 'attachments')
        user = self.request.user
        
        if user.role == 'student':
            return qs.filter(requester=user)
        elif user.role in ['staff', 'faculty']:
            return qs.filter(
                models.Q(assigned_to=user) |
                models.Q(assigned_group__in=user.assignmentgroup_set.all())
            ).distinct()
        # admin sees all
        return qs

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'assign', 'resolve', 'reopen']:
            permission_classes = [IsAuthenticated, IsAssignedOrAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='comments')
    def add_comment(self, request, pk=None):
        ticket = self.get_object()
        serializer = TicketCommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(ticket=ticket, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='assign')
    def assign(self, request, pk=None):
        ticket = self.get_object()
        user_id = request.data.get('user_id')
        group_id = request.data.get('group_id')
        updated = False
        
        if user_id:
            try:
                user = CustomUser.objects.get(id=user_id)
                ticket.assigned_to = user
                updated = True
            except CustomUser.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        if group_id:
            try:
                group = AssignmentGroup.objects.get(id=group_id)
                ticket.assigned_group = group
                updated = True
            except AssignmentGroup.DoesNotExist:
                return Response({'error': 'Group not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        if updated:
            ticket.save()
            return Response({'status': 'assigned'})
        return Response({'error': 'No valid user_id or group_id provided'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'resolved'
        ticket.resolved_at = timezone.now()
        ticket.save()
        return Response({'status': 'resolved'})

    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        ticket = self.get_object()
        if ticket.status in ['resolved', 'closed']:
            ticket.status = 'open'
            ticket.resolved_at = None
            ticket.closed_at = None
            ticket.save()
            return Response({'status': 'reopened'})
        return Response({'error': 'Ticket must be resolved or closed to reopen'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        status_counts = Ticket.objects.values('status').annotate(count=Count('id'))
        priority_counts = Ticket.objects.values('priority').annotate(count=Count('id'))
        total_resolved = Ticket.objects.filter(status='resolved').count()
        sla_met = Ticket.objects.filter(status='resolved', resolved_at__lte=F('sla_resolution_due')).count()
        sla_percentage = (sla_met / total_resolved * 100) if total_resolved > 0 else 0
        unassigned_count = Ticket.objects.filter(assigned_to__isnull=True).count()

        return Response({
            'status_counts': list(status_counts),
            'priority_counts': list(priority_counts),
            'sla_compliance': round(sla_percentage, 2),
            'unassigned_count': unassigned_count,
        })


class TicketCommentViewSet(viewsets.ModelViewSet):
    queryset = TicketComment.objects.all()
    serializer_class = TicketCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_pk')  # if nested, but since flat, perhaps filter by user tickets
        if ticket_id:
            return self.queryset.filter(ticket_id=ticket_id)
        return self.queryset.filter(user=self.request.user)


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

