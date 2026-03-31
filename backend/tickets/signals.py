from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.urls import reverse

from .models import Ticket, TicketComment
from core.utils.rule_engine import evaluate_condition, apply_actions
from core.models import Rule
from notifications.utils import send_notification
from django.utils import timezone


@receiver(post_save, sender=Ticket)
def apply_automation_rules(sender, instance, created, **kwargs):
    # Apply rules only on ticket creation or when reset to 'new'
    if created or instance.status == 'new':
        rules = Rule.objects.filter(is_active=True).order_by('priority')
        for rule in rules:
            if evaluate_condition(instance, rule.conditions):
                apply_actions(instance, rule.actions)
                # Selective save to avoid signal recursion
                update_fields = []
                if instance.assigned_group_id is not None:
                    update_fields.append('assigned_group')
                if instance.priority:
                    update_fields.append('priority')
                if instance.status:
                    update_fields.append('status')
                if instance.custom_fields:
                    update_fields.append('custom_fields')
                instance.save(update_fields=update_fields)
                break  # Apply first matching rule only

@receiver(post_save, sender=Ticket)
def get_ticket_url(ticket, **kwargs):
    return settings.SITE_URL.rstrip('/') + reverse('ticket-detail', args=[ticket.id])

def send_ticket_created_email(ticket):
    ticket_url = get_ticket_url(ticket)
    subject = f"[CUTS] Ticket #{ticket.id} Created: {ticket.title}"
    html_message = render_to_string('emails/ticket_created.html', {'ticket': ticket, 'ticket_url': ticket_url})
    plain_message = render_to_string('emails/ticket_created.txt', {'ticket': ticket, 'ticket_url': ticket_url})
    reply_to = f"ticket+{ticket.id}@inbound.maseno.ac.ke"
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [ticket.requester.email],
        html_message=html_message,
        reply_to=[reply_to],
        fail_silently=False,
    )

def ticket_post_save(sender, instance, created, **kwargs):
    if created:
        send_ticket_created_email(instance)
        # Notify all members of the assigned group
        if instance.assigned_group:
            for member in instance.assigned_group.members.all():
                send_notification(
                    member.id,
                    'ticket_created',
                    'New Ticket Assigned',
                    f'Ticket #{instance.id}: {instance.title}',
                    instance.id
                )
    # On update, if assigned_to or assigned_group changed (simplified)
    elif 'assigned_group' in kwargs.get('update_fields', []) or instance.assigned_to_id or instance.assigned_group_id:
        if instance.assigned_to:
            send_notification(
                instance.assigned_to.id,
                'ticket_assigned',
                'Ticket Assigned to You',
                f'Ticket #{instance.id}: {instance.title}',
                instance.id
            )
        if instance.assigned_group:
            for member in instance.assigned_group.members.all():
                send_notification(
                    member.id,
                    'ticket_assigned_group',
                    'New Ticket in Your Group',
                    f'Ticket #{instance.id}: {instance.title}',
                    instance.id
                )

def send_comment_notification_email(comment):
    ticket = comment.ticket
    ticket_url = get_ticket_url(ticket)
    subject = f"[CUTS] New comment on Ticket #{ticket.id}"
    context = {
        'ticket': ticket,
        'comment': comment,
        'commenter': comment.user.username,
        'ticket_url': ticket_url
    }
    html_message = render_to_string('emails/new_comment.html', context)
    plain_message = render_to_string('emails/new_comment.txt', context)
    reply_to = f"ticket+{ticket.id}@inbound.maseno.ac.ke"
    recipients = []
    if not comment.is_internal:
        recipients.append(ticket.requester.email)
    if ticket.assigned_to and ticket.assigned_to.email != comment.user.email:
        recipients.append(ticket.assigned_to.email)
    if recipients:
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            html_message=html_message,
            reply_to=[reply_to],
            fail_silently=False,
        )

@receiver(post_save, sender=TicketComment)
def comment_post_save(sender, instance, created, **kwargs):
    if created:
        send_comment_notification_email(instance)
        ticket = instance.ticket
        if not instance.is_internal:
            # Notify requester
            send_notification(
                ticket.requester.id,
                'new_comment',
                'New Comment on Your Ticket',
                f'New comment on ticket #{ticket.id}',
                ticket.id
            )
            # Notify assigned agent if exists
            if ticket.assigned_to:
                send_notification(
                    ticket.assigned_to.id,
                    'new_comment',
                    'New Comment on Assigned Ticket',
                    f'New comment on ticket #{ticket.id}',
                    ticket.id
                )
        else:
            # Internal: notify assigned agent and group members (except author)
            if ticket.assigned_to:
                send_notification(
                    ticket.assigned_to.id,
                    'new_internal_note',
                    'New Internal Note',
                    f'Internal note on ticket #{ticket.id}',
                    ticket.id
                )
            if ticket.assigned_group:
                for member in ticket.assigned_group.members.all():
                    if member != instance.user:
                        send_notification(
                            member.id,
                            'new_internal_note',
                            'New Internal Note in Group',
                            f'Internal note on ticket #{ticket.id}',
                            ticket.id
                        )
