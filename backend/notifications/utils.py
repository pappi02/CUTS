from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import datetime
from accounts.models import CustomUser

def send_notification(user_id, notification_type, title, message, ticket_id=None):
    """
    Send a real-time notification to a specific user via their WebSocket group.
    """
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f'user_{user_id}',
            {
                'type': 'send_notification',
                'notification_type': notification_type,
                'title': title,
                'message': message,
                'ticket_id': ticket_id,
                'timestamp': datetime.now().isoformat(),
            }
        )
