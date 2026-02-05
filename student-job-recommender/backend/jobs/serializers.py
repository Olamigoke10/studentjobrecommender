from rest_framework import serializers
from .models import Job


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
