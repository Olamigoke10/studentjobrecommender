from django.contrib import admin

from .models import ApplicationTracker, Job, JobFeedback, SavedJob


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "location", "job_type", "cached_at")
    search_fields = ("title", "company", "external_id")


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ("student", "job", "saved_at")


@admin.register(ApplicationTracker)
class ApplicationTrackerAdmin(admin.ModelAdmin):
    list_display = ("student", "job", "status", "updated_at")


@admin.register(JobFeedback)
class JobFeedbackAdmin(admin.ModelAdmin):
    list_display = ("student", "job", "feedback_type", "created_at")
