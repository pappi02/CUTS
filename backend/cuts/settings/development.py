from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

CORS_ALLOW_ALL_ORIGINS = True  # Dev only
CSRF_COOKIE_SECURE = False


# Debug toolbar (if installed)
INSTALLED_APPS += ['debug_toolbar']
# MIDDLEWARE: debug_toolbar already included in base.py

INTERNAL_IPS = ['127.0.0.1']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
