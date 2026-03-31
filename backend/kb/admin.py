from django.contrib import admin
from .models import Article

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'author', 'is_published', 'created_at']
    list_filter = ['is_published', 'category', 'created_at']
    list_editable = ['is_published']
    search_fields = ['title', 'content']
    readonly_fields = ['slug', 'excerpt', 'created_at', 'updated_at']
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'category')
        }),
        ('Content', {
            'fields': ('content', 'excerpt', 'is_published')
        }),
        ('Meta', {
            'fields': ('author', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

