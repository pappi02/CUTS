from rest_framework import serializers
from .models import Article
from core.models import Category
from core.serializers import CategorySerializer


class KBCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ArticleListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    audience_display = serializers.CharField(source='get_audience_display', read_only=True)
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'excerpt', 'category_name', 'audience_display',
            'created_at', 'updated_at', 'view_count'
        ]

    def get_excerpt(self, obj):
        return (obj.excerpt or obj.content[:200] + '...') if obj.content else ''


class ArticleSerializer(serializers.ModelSerializer):
    category = KBCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category', 
        write_only=True
    )

    class Meta:
        model = Article
        fields = '__all__'
        extra_kwargs = {
            'audience': {'choices': Article.AUDIENCE_CHOICES},
        }

