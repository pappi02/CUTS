from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from core.models import Category, AssignmentGroup
from .utils import add_business_hours

class Ticket(models.Model):
    STATUS_CHOICES = (
        ('new', 'New'),
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('pending_requester', 'Pending (Requester)'),
        ('pending_third_party', 'Pending (Third-Party)'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )
    PRIORITY_CHOICES = (
        ('p1', 'Critical'),
        ('p2', 'High'),
        ('p3', 'Medium'),
        ('p4', 'Low'),
    )
    IMPACT_CHOICES = (
        ('individual', 'Individual'),
        ('group', 'Group'),
        ('department', 'Department'),
        ('campus', 'Campus'),
    )
    URGENCY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='requested_tickets'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_tickets'
    )
    assigned_group = models.ForeignKey(
        AssignmentGroup,
        on_delete=models.PROTECT,
        related_name='tickets'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='tickets'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    priority = models.CharField(max_length=2, choices=PRIORITY_CHOICES, default='p3')
    impact = models.CharField(max_length=20, choices=IMPACT_CHOICES)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES)
    location = models.CharField(max_length=255, blank=True, help_text="Building/room for facilities tickets")
    attachments = models.ManyToManyField('Attachment', blank=True, related_name='tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    # SLA fields (computed in save())
    sla_response_due = models.DateTimeField()
    sla_resolution_due = models.DateTimeField()
    # SLA notification flags
    sla_approaching_notified = models.BooleanField(default=False)
    sla_breached_notified = models.BooleanField(default=False)
    # Custom fields
    custom_fields = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        from django.utils import timezone
        now = timezone.now()
        # Compute priority if not set
        if not self.priority:
            matrix = {
                ('campus', 'critical'): 'p1',
                ('campus', 'high'): 'p1',
                ('campus', 'medium'): 'p2',
                ('campus', 'low'): 'p3',
                ('department', 'critical'): 'p1',
                ('department', 'high'): 'p2',
                ('department', 'medium'): 'p3',
                ('department', 'low'): 'p3',
                ('group', 'critical'): 'p2',
                ('group', 'high'): 'p2',
                ('group', 'medium'): 'p3',
                ('group', 'low'): 'p4',
                ('individual', 'critical'): 'p2',
                ('individual', 'high'): 'p3',
                ('individual', 'medium'): 'p4',
                ('individual', 'low'): 'p4',
            }
            self.priority = matrix.get((self.impact, self.urgency), 'p3')
# SLA based on priority (business hours aware)
        sla_map = {
            'p1': {'response': timedelta(minutes=15), 'resolution': timedelta(hours=4)},
            'p2': {'response': timedelta(hours=1), 'resolution': timedelta(hours=24)},
            'p3': {'response': timedelta(hours=4), 'resolution': timedelta(days=3)},
            'p4': {'response': timedelta(days=1), 'resolution': timedelta(days=5)},
        }
        pri = self.priority or 'p3'
        if not self.sla_response_due:
            self.sla_response_due = add_business_hours(now, sla_map[pri]['response'])
        if not self.sla_resolution_due:
            self.sla_resolution_due = add_business_hours(now, sla_map[pri]['resolution'])
        super().save(*args, **kwargs)

    def __str__(self):
        return f"#{self.id} - {self.title}"


class TicketComment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    is_internal = models.BooleanField(default=False, help_text="Internal note vs public reply")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user} on {self.ticket}"


class Attachment(models.Model):
    file = models.FileField(upload_to='attachments/%Y/%m/%d/')
    filename = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.filename and self.file:
            self.filename = self.file.name.split('/')[-1]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.filename or self.file.name

