from rest_framework import generics, permissions, filters
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Article
from .serializers import ArticleListSerializer, ArticleSerializer, KBCategorySerializer
from core.models import Category



class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class KBPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return user and user.is_authenticated and (user.is_staff or hasattr(user, 'role') and user.role in ['admin', 'staff', 'faculty'])


class ArticleListCreateView(generics.ListCreateAPIView):
    serializer_class = ArticleListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    filterset_fields = ['category', 'is_published', 'audience']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']
    permission_classes = [KBPermission]

    def get_queryset(self):
        queryset = Article.objects.select_related('category', 'author').filter(is_published=True)
        user = self.request.user
        
        # Filter based on user role and article audience
        if user and user.is_authenticated:
            user_role = getattr(user, 'role', None)
            
            # Students can see 'all' and 'student' articles
            if user_role == 'student':
                queryset = queryset.filter(Q(audience='all') | Q(audience='student'))
            # Staff and faculty can see 'all' and 'staff' articles
            elif user_role in ['staff', 'faculty']:
                queryset = queryset.filter(Q(audience='all') | Q(audience='staff'))
            # Admins can see all articles
            elif user_role == 'admin' or user.is_staff or user.is_superuser:
                pass  # No additional filtering needed
            else:
                # Default: only 'all' articles for unknown roles
                queryset = queryset.filter(audience='all')
        else:
            # Anonymous users can only see 'all' articles
            queryset = queryset.filter(audience='all')
            
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'LIST':
            return ArticleListSerializer
        return ArticleSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        self.filter_queryset(self.get_queryset())  # refresh


class ArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.select_related('category', 'author')
    serializer_class = ArticleSerializer
    permission_classes = [KBPermission]
    lookup_field = 'pk'


class KBCategoriesList(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True).order_by('name')
    serializer_class = KBCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class StudentArticlesView(generics.ListAPIView):
    serializer_class = ArticleListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Article.objects.select_related('category', 'author').filter(
            is_published=True,
            audience__in=['student', 'all']
        )
        popular = self.request.query_params.get('popular')
        limit = self.request.query_params.get('limit', 5)
        if popular == 'true':
            queryset = queryset.order_by('-view_count')[:int(limit)]
        else:
            queryset = queryset.order_by('-updated_at')[:int(limit)]
        return queryset
