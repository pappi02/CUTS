from django.db import models
from django.conf import settings
from django.utils import timezone
from tickets.models import Ticket, TicketComment


class Notification(models.Model):
    TYPE_CHOICES = [
        ('ticket_created', 'Ticket Created'),
        ('ticket_assigned', 'Ticket Assigned'),
        ('ticket_status_changed', 'Status Changed'),
        ('new_comment', 'New Comment'),
        ('sla_approaching', 'SLA Approaching'),
        ('sla_breached', 'SLA Breached'),
        ('system', 'System Announcement'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    related_ticket = models.ForeignKey(
        Ticket,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"

    def mark_as_read(self):
        self.is_read = True
        self.save(update_fields=['is_read'])
