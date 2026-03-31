from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'school', 'department', 'is_staff')
    list_filter = ('role', 'school', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Campus Info', {'fields': ('role', 'student_id', 'employee_id', 'school', 'department')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Campus Info', {'fields': ('role', 'student_id', 'employee_id', 'school', 'department')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
