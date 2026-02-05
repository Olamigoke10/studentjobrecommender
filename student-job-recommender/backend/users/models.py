from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # You can add additional fields here if needed
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
    

class Skill (models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class StudentProfile(models.Model):
    JOB_TYPE_CHOICES = [
        ("internship", "Internship"),
        ("part_time", "Part-time"),
        ("graduate", "Graduate"),
        ("full_time", "Full-time"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    skills = models.ManyToManyField(Skill, related_name="students", blank=True)

    preferred_job_type = models.CharField(
        max_length=20, choices=JOB_TYPE_CHOICES, default="graduate"
    )
    preferred_location = models.CharField(max_length=150, blank=True)
    course = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.course}"
