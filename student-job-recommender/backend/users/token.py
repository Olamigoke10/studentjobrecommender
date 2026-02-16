from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework.exceptions import AuthenticationFailed


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        email = (attrs.get(self.username_field) or "").strip().lower()
        password = attrs.get("password", "")

        User = get_user_model()
        user = User.objects.filter(email__iexact=email).first()

        if not user or not user.check_password(password):
            raise AuthenticationFailed(
                "No active account found with the given credentials",
                "no_active_account",
            )

        if not api_settings.USER_AUTHENTICATION_RULE(user):
            raise AuthenticationFailed(
                "No active account found with the given credentials",
                "no_active_account",
            )

        self.user = user
        refresh = self.get_token(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, user)
        return data
