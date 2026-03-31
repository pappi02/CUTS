from rest_framework import serializers
from .models import Ticket, TicketComment, Attachment
from accounts.serializers import CustomUserSerializer
from core.serializers import CategorySerializer, AssignmentGroupSerializer


class TicketCommentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = TicketComment
        fields = ['id', 'user', 'content', 'is_internal', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class TicketListSerializer(serializers.ModelSerializer):
    requester = CustomUserSerializer(read_only=True)
    assigned_to = CustomUserSerializer(read_only=True)
    assigned_group = serializers.StringRelatedField()
    category = serializers.StringRelatedField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'status', 'priority', 'impact', 'urgency',
            'requester', 'assigned_to', 'assigned_group', 'category',
            'created_at', 'updated_at', 'comment_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_comment_count(self, obj):
        return obj.comments.count()


class TicketCreateSerializer(serializers.ModelSerializer):
    attachments = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Attachment.objects.all(), required=False
    )

    class Meta:
        model = Ticket
        fields = [
            'title', 'description', 'category', 'impact', 'urgency',
            'location', 'custom_fields', 'attachments'
        ]

    def validate_category(self, value):
        if not value.default_assignment_group:
            raise serializers.ValidationError("Selected category has no default assignment group.")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['requester'] = request.user
        category = validated_data['category']
        validated_data['assigned_group'] = category.default_assignment_group
        
        attachments = validated_data.pop('attachments', [])
        ticket = super().create(validated_data)
        ticket.attachments.set(attachments)
        return ticket


class AttachmentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ['id', 'filename', 'file', 'url', 'uploaded_at']
        read_only_fields = ['id', 'filename', 'url', 'uploaded_at']

    def get_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None


class TicketDetailSerializer(serializers.ModelSerializer):
    requester = CustomUserSerializer(read_only=True)
    assigned_to = CustomUserSerializer(read_only=True)
    assigned_group = AssignmentGroupSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    comments = TicketCommentSerializer(source='comments', many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True, context={'request': None}) # request will be set in view

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'resolved_at', 'closed_at',
            'sla_response_due', 'sla_resolution_due', 'requester', 'assigned_group'
        ]
