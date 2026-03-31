from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

class CookieJWTAuthentication(JWTAuthentication):
    """
    JWT Authentication using cookie instead of Authorization header
    """
    def authenticate(self, request):
        # First try standard header auth
        header = self.get_header(request)
        if header:
            return super().authenticate(request)

        # Then try cookie
        raw_token = request.COOKIES.get(settings.SIMPLE_JWT.get('AUTH_COOKIE', 'auth_access_token'))
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token

