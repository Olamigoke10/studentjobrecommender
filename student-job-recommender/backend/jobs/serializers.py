from rest_framework import serializers
from .models import Job, ApplicationTracker


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "id",
            "external_id",
            "source",
            "title",
            "company",
            "location",
            "description",
            "job_type",
            "url",
            "posted_date",
            "cached_at",
        ]


class ApplicationTrackerSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = ApplicationTracker
        fields = ["id", "job", "status", "applied_at", "notes", "updated_at"]
        read_only_fields = ["applied_at", "updated_at"]
