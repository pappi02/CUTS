from django.db import models
from django.conf import settings
from mptt.models import MPTTModel
from mptt.fields import TreeForeignKey


class School(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name


class Department(models.Model):
    name = models.CharField(max_length=255)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    code = models.CharField(max_length=10)

    class Meta:
        unique_together = ('school', 'code')

    def __str__(self):
        return f"{self.name} ({self.school.code}-{self.code})"


class Category(MPTTModel):
    name = models.CharField(max_length=255)
    parent = TreeForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    default_assignment_group = models.ForeignKey('AssignmentGroup', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class MPTTMeta:
        order_insertion_by = ['name']

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class AssignmentGroup(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10)
    school = models.ForeignKey(School, on_delete=models.CASCADE, null=True, blank=True, help_text="Leave blank for campus-wide support groups")
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True)
    supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervised_groups',
        help_text="User who receives escalated SLA breaches"
    )

    class Meta:
        verbose_name_plural = "Assignment Groups"

    def __str__(self):
        return f"{self.name} ({self.code})"


class BusinessHours(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    day = models.IntegerField(choices=DAYS_OF_WEEK, unique=True)
    start_time = models.TimeField(default='09:00')
    end_time = models.TimeField(default='17:00')
    is_working_day = models.BooleanField(default=True)

    class Meta:
        ordering = ['day']

    def __str__(self):
        if self.is_working_day:
            return f"{self.get_day_display()}: {self.start_time} - {self.end_time}"
        return f"{self.get_day_display()}: Closed"


class Rule(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Lower number = higher priority")
    # Conditions stored as JSON
    conditions = models.JSONField(help_text='JSON structure of conditions, e.g. {{"and": [{{"field": "category", "operator": "in", "value": [1,2]}, {{"field": "urgency", "operator": "eq", "value": "high"}}]}}')
    # Actions stored as JSON
    actions = models.JSONField(help_text='JSON structure of actions, e.g. {{"assign_group": 5, "set_priority": "p1"}}')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority']

    def __str__(self):
        return self.name

