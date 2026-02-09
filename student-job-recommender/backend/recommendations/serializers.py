from rest_framework import serializers
from jobs.serializers import JobSerializer
from jobs.models import Job


class RecommendedJobSerializer(JobSerializer):
    match_score = serializers.IntegerField(read_only=True)
    recommended_reason = serializers.ListField(
        child=serializers.CharField(), read_only=True
    )

    class Meta(JobSerializer.Meta):
        model = Job
        fields = JobSerializer.Meta.fields + ["match_score", "recommended_reason"]
