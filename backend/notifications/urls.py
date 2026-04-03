from django.urls import path
from .views import inbound_email, NotificationViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', NotificationViewSet)

urlpatterns = [
    path('inbound-email/', inbound_email, name='inbound-email'),
] + router.urls
