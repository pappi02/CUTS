from django.contrib import admin
from .models import Ticket, TicketComment, Attachment

class TicketCommentInline(admin.TabularInline):
    model = TicketComment
    extra = 0
    readonly_fields = ('created_at',)

class AttachmentInline(admin.TabularInline):
    model = Ticket.attachments.through
    extra = 0
    verbose_name = "Attachment"
    verbose_name_plural = "Attachments"

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'requester', 'assigned_to', 'assigned_group', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority', 'category', 'assigned_group')
    search_fields = ('title', 'description', 'requester__username')
    readonly_fields = ('created_at', 'updated_at', 'resolved_at', 'closed_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'requester', 'category')
        }),
        ('Assignment', {
            'fields': ('assigned_to', 'assigned_group')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'impact', 'urgency')
        }),
        ('SLA', {
            'fields': ('sla_response_due', 'sla_resolution_due'),
            'classes': ('collapse',)
        }),
        ('Location & Custom', {
            'fields': ('location', 'custom_fields'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at', 'closed_at'),
            'classes': ('collapse',)
        }),
    )
    inlines = [TicketCommentInline, AttachmentInline]

@admin.register(TicketComment)
class TicketCommentAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'user', 'is_internal', 'created_at')
    list_filter = ('is_internal',)
    search_fields = ('content',)

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('filename', 'uploaded_by', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('filename',)

