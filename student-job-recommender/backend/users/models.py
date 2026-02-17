from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save


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
    name = models.CharField(max_length=150, blank=True)
    skills = models.ManyToManyField(Skill, related_name="students", blank=True)

    preferred_job_type = models.CharField(
        max_length=20, choices=JOB_TYPE_CHOICES, default="graduate"
    )
    preferred_location = models.CharField(max_length=150, blank=True)
    course = models.CharField(max_length=150, blank=True)
    cv_summary = models.TextField(blank=True, help_text="Personal statement / summary for CV")

    def __str__(self):
        return f"{self.user.email} - {self.course}"


class Education(models.Model):
    """CV education entry."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="cv_education")
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=100, blank=True)  # e.g. BSc, BA, MSc
    subject = models.CharField(max_length=200, blank=True)  # e.g. Computer Science
    start_date = models.CharField(max_length=50, blank=True)  # e.g. 2020 or Sept 2020
    end_date = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "-id"]


class Experience(models.Model):
    """CV work / voluntary experience entry."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="cv_experience")
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    start_date = models.CharField(max_length=50, blank=True)
    end_date = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "-id"]


        
        