from django.db import models
from django.conf import settings
from django.utils.text import slugify
from core.models import Category


class Article(models.Model):
    AUDIENCE_CHOICES = [
        ('all', 'All Users'),
        ('student', 'Students Only'),
        ('staff', 'Staff Only'),
    ]
    
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True, max_length=500)
    category = models.ForeignKey(
        Category, 
        on_delete=models.PROTECT, 
        related_name='kb_articles'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='kb_articles'
    )
    audience = models.CharField(max_length=10, choices=AUDIENCE_CHOICES, default='all')
    view_count = models.IntegerField(default=0)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if not self.excerpt and self.content:
            self.excerpt = self.content[:200] + '...'
        super().save(*args, **kwargs)

