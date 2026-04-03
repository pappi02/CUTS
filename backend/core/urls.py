from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SchoolViewSet,
    DepartmentViewSet,
    CategoryViewSet,
    AssignmentGroupViewSet,
    CategoryListView,
    SchoolListView,
    AdminHealthView,
    AdminMetricsView,
)

urlpatterns = [
    path('schools/', SchoolListView.as_view(), name='school-list'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('admin/health/', AdminHealthView.as_view(), name='admin-health'),
    path('admin/metrics/', AdminMetricsView.as_view(), name='admin-metrics'),
]
