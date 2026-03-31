import os
from celery import Celery
from celery.schedules import crontab
from django.conf import settings


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cuts.settings.development')

app = Celery('cuts')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()


app.conf.beat_schedule = {
    'check-sla-breaches': {
        'task': 'tickets.tasks.check_sla_breaches',
        'schedule': crontab(minute='*/5'),  # every 5 minutes
    },
    'check-approaching-sla': {
        'task': 'tickets.tasks.check_approaching_sla',
        'schedule': crontab(minute='*/10'),  # every 10 minutes
    },
}

app.conf.timezone = 'Africa/Nairobi'
