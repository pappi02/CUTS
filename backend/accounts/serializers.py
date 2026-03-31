from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings

class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        request = self.context['request']
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        if refresh_token is None:
            raise InvalidToken('No refresh token found in cookie.')
        attrs['refresh'] = refresh_token
        return super().validate(attrs)


from core.serializers import SchoolSerializer, DepartmentSerializer

class UserSerializer(serializers.ModelSerializer):
    school_detail = SchoolSerializer(source='school', read_only=True)
    department_detail = DepartmentSerializer(source='department', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'student_id', 'employee_id', 'school', 'department', 'school_detail', 'department_detail']

class LoginSerializer(TokenObtainPairSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']


    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise serializers.ValidationError('Must include username and password')

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError('Invalid credentials')

        self.user = user
        token = self.get_token(self.user)

        return {
            'access': str(token.access_token),
            'refresh': str(token),
        }
