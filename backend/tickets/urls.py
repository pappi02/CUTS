from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, TicketCommentViewSet, AttachmentViewSet

router = DefaultRouter()
router.register(r'', TicketViewSet)
router.register(r'comments', TicketCommentViewSet)
router.register(r'attachments', AttachmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
