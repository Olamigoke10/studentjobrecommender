from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import StudentProfile, Skill

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data['username']
        )
        user.set_password(validated_data['password'])
        user.save()
        
        StudentProfile.objects.create(
            user=user,
            course ="Not Specified",
            preferred_job_type="graduate",
            preferred_location="Not Specified"
            )
        return user
    
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']
        

class StudentProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    
    skills_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = StudentProfile
        fields = ['skills', 'preferred_job_type', 'preferred_location', 'course']
        
    def update(self, instance, validated_data):
        skills_ids = validated_data.pop('skills_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if skills_ids is not None:
            skills = Skill.objects.filter(id__in=skills_ids)
            instance.skills.set(skills)
        
        instance.save()
        return instance