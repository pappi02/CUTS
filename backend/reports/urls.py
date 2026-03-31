from django.urls import path
from .views import (
    TicketVolumeReport,
    SLAComplianceReport, 
    AgentPerformanceReport,
    ExportReport,
    ExportStatus,
)

urlpatterns = [
    path('ticket-volume/', TicketVolumeReport.as_view(), name='ticket-volume'),
    path('sla-compliance/', SLAComplianceReport.as_view(), name='sla-compliance'),
    path('agent-performance/', AgentPerformanceReport.as_view(), name='agent-performance'),
    path('export/', ExportReport.as_view(), name='export-report'),
    path('export/<str:task_id>/', ExportStatus.as_view(), name='export-status'),
]

