from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

import logging
logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user_from_token(token_key):
    """Get user from JWT token key."""
    try:
        token = AccessToken(token_key)
        user_id = token.get('user_id') or token.get('sub')
        if not user_id:
            logger.warning("No user_id or sub in token")
            return AnonymousUser()
        user = User.objects.get(id=user_id)
        logger.info(f"Token validated for user_id: {user_id} ({user.username})")
        return user
    except Exception as e:
        logger.error(f"Token validation failed for token_key: {token_key[:20]}... Error: {str(e)}")
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        # Extract token from query_string ?token=... or cookie 'auth_access_token'
        token_key = None
        
        # Try query_string first
        query_string = scope.get('query_string', b'').decode('utf8')
        for param in query_string.split('&'):
            if param.startswith('token='):
                token_key = param.split('=', 1)[1]
                logger.info(f"Token from query: {token_key[:20]}...")
                break
        
        # Fallback to cookie
        if not token_key:
            headers = dict(scope["headers"])
            cookie_header = headers.get(b"cookie", b"").decode("utf8")
            for cookie in cookie_header.split(";"):
                if 'auth_access_token=' in cookie:
                    token_key = cookie.split("auth_access_token=")[1].split(";")[0].strip()
                    logger.info(f"Token from cookie: {token_key[:20]}...")
                    break
        
        if token_key:
            scope['user'] = await get_user_from_token(token_key)
        else:
            logger.info("No token found in query or cookie")
        # Falls through to next middleware (AuthMiddlewareStack) if no token

        return await super().__call__(scope, receive, send)
