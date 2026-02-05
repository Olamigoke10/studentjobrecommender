from django.db import models
from users.models import StudentProfile  

# Create your models here.
class Job(models.Model):
    source = models.CharField(max_length=100, default="api")
    external_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    job_type = models.CharField(max_length=50, blank=True)
    url = models.URLField(max_length=500, blank=True)
    posted_date = models.DateField(null=True, blank=True)
    cached_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} at {self.company}"
    
    
class SavedJob(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by_students')
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('student', 'job')
    
    def __str__(self):
        return f"{self.student.user.email} saved {self.job.title}"
    
    
class ApplicationTracker(models.Model):
    APPLICATION_STATUS_CHOICES = [
        ('saved', 'Saved'),
        ('applied', 'Applied'),
        ('interviewing', 'Interviewing'),
        ('offered', 'Offered'),
        ('rejected', 'Rejected'),
    ]
    
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applicants')
    status = models.CharField(max_length=20, choices=APPLICATION_STATUS_CHOICES, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('student', 'job')
    
    def __str__(self):
        return f"{self.student.user.email} - {self.job.title} ({self.status})"


