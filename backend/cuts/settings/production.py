from .base import *

DEBUG = False

ALLOWED_HOSTS += ['*']  # Tighten in prod

CORS_ALLOW_ALL_ORIGINS = False
CSRF_COOKIE_SECURE = True


# Gunicorn/secure
USE_TZ = True
