from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    username_field = 'email'
    
    def validate(self, attrs):
        credentials = {
            "email": attrs.get("email"),
            "password": attrs.get("password")
        }
        
        user = authenticate(**credentials)
        
        if not user:
            raise Exception("Invalid email or password")
        
        
        data = super().validate(attrs)
        data["email"] = user.email
        return data
