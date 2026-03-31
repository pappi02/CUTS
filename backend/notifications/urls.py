from django.urls import path
from .views import inbound_email

urlpatterns = [
    path('inbound-email/', inbound_email, name='inbound-email'),
]
