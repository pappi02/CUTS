import django_filters
from django_filters import rest_framework as filters
from .models import Ticket
from accounts.models import CustomUser
from core.models import Category, AssignmentGroup


class TicketFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Ticket.STATUS_CHOICES)
    priority = django_filters.ChoiceFilter(choices=Ticket.PRIORITY_CHOICES)
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.all())
    assigned_to = django_filters.CharFilter(method='filter_assigned_to')
    assigned_group = django_filters.CharFilter(method='filter_assigned_group')
    requester = django_filters.ModelChoiceFilter(queryset=CustomUser.objects.all())
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Ticket
        fields = ['status', 'priority', 'category', 'assigned_to', 'assigned_group', 'requester']

    def filter_assigned_to(self, queryset, name, value):
        if value == 'null':
            return queryset.filter(**{name + '__isnull': True})
        return queryset.filter(**{name: value})

    def filter_assigned_group(self, queryset, name, value):
        if value == 'null':
            return queryset.filter(**{name + '__isnull': True})
        return queryset.filter(**{name: value})
