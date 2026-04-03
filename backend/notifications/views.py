import json
import logging
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.contrib.auth import get_user_model
from tickets.models import Ticket, TicketComment
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all marked as read'})


@csrf_exempt
@require_http_methods(["POST"])
def inbound_email(request):
    """
    Handle incoming email from Mailgun/SendGrid.
    Expected POST data:
        - from: sender email
        - recipient: ticket+ID@domain
        - stripped-text or body-plain: text body
    """
    # Auth
    auth_token = request.headers.get('X-Inbound-Token')
    if auth_token != settings.INBOUND_EMAIL_TOKEN:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    # Parse data
    if request.content_type == 'application/json':
        data = json.loads(request.body)
    else:
        data = request.POST.dict()

    sender_email = data.get('from', '').split('<')[-1].rstrip('>')
    recipient = data.get('recipient', '')
    body = data.get('stripped-text') or data.get('body-plain') or data.get('text', '')

    if not sender_email or not recipient or not body:
        logger.warning(f"Incomplete email data")
        return JsonResponse({'error': 'Missing fields'}, status=400)

    # Extract ticket ID
    match = re.search(r'ticket\+(\d+)@', recipient)
    if not match:
        logger.warning(f"No ticket ID in {recipient}")
        return JsonResponse({'error': 'Invalid recipient'}, status=400)
    ticket_id = int(match.group(1))

    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        logger.warning(f"Ticket {ticket_id} not found")
        return JsonResponse({'error': 'Ticket not found'}, status=404)

    User = get_user_model()
    try:
        user = User.objects.get(email=sender_email)
    except User.DoesNotExist:
        logger.warning(f"User {sender_email} not found")
        return JsonResponse({'error': 'Sender not found'}, status=404)

    # Authorization: requester, assigned_to, or group member
    is_authorized = (
        user == ticket.requester or
        user == ticket.assigned_to or
        (ticket.assigned_group and ticket.assigned_group.members.filter(id=user.id).exists())
    )
    if not is_authorized:
        logger.warning(f"Unauthorized comment from {user} on ticket {ticket_id}")
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    # Create comment
    comment = TicketComment.objects.create(
        ticket=ticket,
        user=user,
        content=body.strip(),
        is_internal=False
    )

    logger.info(f"Added inbound comment {comment.id} to ticket {ticket.id} from {sender_email}")
    return JsonResponse({'status': 'ok', 'comment_id': comment.id}, status=201)

