import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from accounts.models import CustomUser
import logging
logger = logging.getLogger(__name__)

class NotificationConsumer(AsyncWebsocketConsumer):
    @database_sync_to_async
    def get_user_group(self):
        user = self.scope['user']
        if user.is_authenticated:
            return f'user_{user.id}'
        return None

    async def connect(self):
        print("🔥 WS CONNECT HIT")
        self.group_name = await self.get_user_group()
        user = self.scope["user"]
        logger.info(f"WS connect attempt - user: {user} (auth: {user.is_authenticated}, anon: {user.is_anonymous}, id: {getattr(user, 'id', 'None')})")
        if self.group_name:
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()
            logger.info(f"WS accepted for group: {self.group_name}")
        else:
            logger.warning(f"WS rejected for {self.channel_name} - no group (user: {user})")
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name') and self.group_name:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'ping':
            await self.send(text_data=json.dumps({'type': 'pong'}))
            return

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': event['notification_type'],
            'title': event['title'],
            'message': event['message'],
            'ticket_id': event.get('ticket_id'),
            'timestamp': event['timestamp'],
        }))
