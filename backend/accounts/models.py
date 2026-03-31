from django.contrib.auth.models import AbstractUser
from django.db import models
class CustomUser(AbstractUser):
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='custom groups',
        blank=True,
        help_text='The groups this custom user belongs to.',
        related_name="custom_user_set",
        related_query_name="custom_user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='custom user permissions',
        blank=True,
        help_text='Specific permissions for this custom user.',
        related_name="custom_user_set",
        related_query_name="custom_user",
    )
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('staff', 'Staff'),
        ('faculty', 'Faculty'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    student_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    employee_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    school = models.ForeignKey('core.School', on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey('core.Department', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.username

# Set as custom user model (in settings: AUTH_USER_MODEL = 'accounts.CustomUser')

