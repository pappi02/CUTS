from django.urls import path
from .views import (
    ArticleListCreateView, 
    ArticleDetailView, 
    KBCategoriesList,
    StudentArticlesView
)

urlpatterns = [
    path('articles/', ArticleListCreateView.as_view(), name='kb-article-list-create'),
    path('articles/<int:pk>/', ArticleDetailView.as_view(), name='kb-article-detail'),
    path('articles/student/', StudentArticlesView.as_view(), name='kb-student-articles'),
    path('categories/', KBCategoriesList.as_view(), name='kb-categories-list'),
]
