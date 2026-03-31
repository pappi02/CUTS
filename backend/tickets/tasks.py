from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from datetime import timedelta
from .models import Ticket


def get_ticket_url(ticket):
    """Get the frontend URL for the ticket."""
    return f"http://localhost:8000/tickets/{ticket.id}/"


@shared_task
def check_approaching_sla():
    """
    Find tickets where SLA is approaching (within 30 minutes of response due
    or 2 hours of resolution due) and send a reminder email to assigned agent.
    """
    now = timezone.now()
    # Approaching response SLA (30 minutes before)
    response_threshold = now + timedelta(minutes=30)
    approaching_response = Ticket.objects.filter(
        status__in=['new', 'open', 'in_progress'],
        sla_response_due__lte=response_threshold,
        sla_response_due__gt=now,
        sla_approaching_notified=False
    )
    for ticket in approaching_response:
        send_sla_approaching_email(ticket, 'response')
        ticket.sla_approaching_notified = True
        ticket.save(update_fields=['sla_approaching_notified'])

    # Approaching resolution SLA (2 hours before)
    resolution_threshold = now + timedelta(hours=2)
    approaching_resolution = Ticket.objects.filter(
        status__in=['new', 'open', 'in_progress'],
        sla_resolution_due__lte=resolution_threshold,
        sla_resolution_due__gt=now,
        sla_approaching_notified=False
    )
    for ticket in approaching_resolution:
        send_sla_approaching_email(ticket, 'resolution')
        ticket.sla_approaching_notified = True
        ticket.save(update_fields=['sla_approaching_notified'])


def send_sla_approaching_email(ticket, sla_type):
    recipients = []
    if ticket.assigned_to:
        recipients.append(ticket.assigned_to.email)
    if ticket.assigned_group:
        recipients.extend(ticket.assigned_group.members.values_list('email', flat=True))
    recipients = list(set(recipients))  # unique

    if not recipients:
        return

    subject = f"[CUTS] SLA Approaching: Ticket #{ticket.id}"
    due_date = getattr(ticket, f'sla_{sla_type}_due')
    ticket_url = get_ticket_url(ticket)
    context = {
        'ticket': ticket,
        'sla_type': sla_type,
        'due_date': due_date,
        'ticket_url': ticket_url,
    }
    html_message = render_to_string('emails/sla_approaching.html', context)
    plain_message = render_to_string('emails/sla_approaching.txt', context)

    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        recipients,
        html_message=html_message,
        fail_silently=False,
    )


@shared_task
def check_sla_breaches():
    """
    Find tickets where SLA has been breached (response or resolution overdue)
    and send breach notifications, then escalate to supervisor.
    """
    now = timezone.now()
    # Response breached
    breached_response = Ticket.objects.filter(
        status__in=['new', 'open', 'in_progress', 'pending_requester', 'pending_third_party'],
        sla_response_due__lt=now,
        sla_breached_notified=False
    )
    for ticket in breached_response:
        send_sla_breach_email(ticket, 'response')
        ticket.sla_breached_notified = True
        ticket.save(update_fields=['sla_breached_notified'])
        # Escalate to supervisor
        escalate_sla_breach(ticket, 'response')

    # Resolution breached
    breached_resolution = Ticket.objects.filter(
        status__in=['new', 'open', 'in_progress', 'pending_requester', 'pending_third_party'],
        sla_resolution_due__lt=now,
        sla_breached_notified=False
    )
    for ticket in breached_resolution:
        send_sla_breach_email(ticket, 'resolution')
        ticket.sla_breached_notified = True
        ticket.save(update_fields=['sla_breached_notified'])
        escalate_sla_breach(ticket, 'resolution')


def send_sla_breach_email(ticket, sla_type):
    recipients = []
    if ticket.assigned_to:
        recipients.append(ticket.assigned_to.email)
    if ticket.assigned_group:
        recipients.extend(ticket.assigned_group.members.values_list('email', flat=True))
    recipients = list(set(recipients))

    if not recipients:
        return

    subject = f"[CUTS] SLA BREACHED: Ticket #{ticket.id}"
    due_date = getattr(ticket, f'sla_{sla_type}_due')
    ticket_url = get_ticket_url(ticket)
    context = {
        'ticket': ticket,
        'sla_type': sla_type,
        'due_date': due_date,
        'ticket_url': ticket_url,
    }
    html_message = render_to_string('emails/sla_breach.html', context)
    plain_message = render_to_string('emails/sla_breach.txt', context)

    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        recipients,
        html_message=html_message,
        fail_silently=False,
    )


def escalate_sla_breach(ticket, sla_type):
    """
    Notify the supervisor of the assigned group.
    """
    if ticket.assigned_group and ticket.assigned_group.supervisor:
        supervisor = ticket.assigned_group.supervisor
        subject = f"[CUTS] ESCALATION: SLA Breach on Ticket #{ticket.id}"
        due_date = getattr(ticket, f'sla_{sla_type}_due')
        ticket_url = get_ticket_url(ticket)
        context = {
            'ticket': ticket,
            'sla_type': sla_type,
            'due_date': due_date,
            'supervisor': supervisor,
            'ticket_url': ticket_url,
        }
        html_message = render_to_string('emails/sla_escalation.html', context)
        plain_message = render_to_string('emails/sla_escalation.txt', context)
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [supervisor.email],
            html_message=html_message,
            fail_silently=False,
        )
