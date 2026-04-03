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
    requester = django_filters.CharFilter(method='filter_requester')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Ticket
        fields = ['status', 'priority', 'category', 'assigned_to', 'assigned_group', 'requester']

    def filter_assigned_to(self, queryset, name, value):
        if not value:
            return queryset
        if value == 'null':
            return queryset.filter(**{name + '__isnull': True})
        if value == 'me':
            return queryset.filter(assigned_to=self.request.user)
        try:
            # Try to convert to integer for direct ID filtering
            user_id = int(value)
            return queryset.filter(assigned_to_id=user_id)
        except (ValueError, TypeError):
            # If not an integer, return empty queryset
            return queryset.none()

    def filter_assigned_group(self, queryset, name, value):
        if value == 'null':
            return queryset.filter(**{name + '__isnull': True})
        return queryset.filter(**{name: value})

    def filter_requester(self, queryset, name, value):
        if not value:
            return queryset
        if value == 'me':
            return queryset.filter(requester=self.request.user)
        try:
            # Try to convert to integer for direct ID filtering
            user_id = int(value)
            return queryset.filter(requester_id=user_id)
        except (ValueError, TypeError):
            # If not an integer, return empty queryset
            return queryset.none()
