from django.contrib import admin
from mptt.admin import MPTTModelAdmin
from .models import School, Department, Category, AssignmentGroup, BusinessHours, Rule

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'school', 'code')
    list_filter = ('school',)

@admin.register(Category)
class CategoryAdmin(MPTTModelAdmin):
    list_display = ('name', 'parent', 'default_assignment_group', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)
    mptt_level_indent = 20

@admin.register(AssignmentGroup)
class AssignmentGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'school', 'department', 'is_active')
    list_filter = ('is_active', 'school', 'department')
    filter_horizontal = ('members',)
    search_fields = ('name', 'code')

@admin.register(BusinessHours)
class BusinessHoursAdmin(admin.ModelAdmin):
    list_display = ('day', 'is_working_day', 'start_time', 'end_time')
    list_editable = ('start_time', 'end_time', 'is_working_day')

@admin.register(Rule)
class RuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'priority', 'created_at')
    list_filter = ('is_active',)
    list_editable = ('is_active', 'priority')
    search_fields = ('name', 'description')
