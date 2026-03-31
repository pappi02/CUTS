import os
from django.core.asgi import get_asgi_application
import django
django.setup()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cuts.settings.development')

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from notifications.middleware import TokenAuthMiddleware

from notifications.routing import websocket_urlpatterns

http_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": http_app,
    "websocket": AllowedHostsOriginValidator(
        TokenAuthMiddleware(
            AuthMiddlewareStack(
                URLRouter(websocket_urlpatterns)
            )
        )
    ),
})
