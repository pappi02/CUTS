from rest_framework import serializers
from .models import Notification
from tickets.serializers import TicketListSerializer
from accounts.serializers import CustomUserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    related_ticket_detail = serializers.SerializerMethodField(read_only=True)
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'notification_type_display',
            'title', 'message', 'related_ticket', 'related_ticket_detail',
            'is_read', 'created_at'
        ]
        read_only_fields = [
            'id', 'user', 'notification_type_display', 'related_ticket_detail',
            'created_at', 'is_read'
        ]

    def get_related_ticket_detail(self, obj):
        if obj.related_ticket:
            return TicketListSerializer(obj.related_ticket).data
        return None
