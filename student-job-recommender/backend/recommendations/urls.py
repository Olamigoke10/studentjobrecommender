from django.urls import path
from recommendations.views import RecommendedJobsView, RecommendationFeedbackView


urlpatterns = [
    path("", RecommendedJobsView.as_view(), name="recommended_jobs"),
    path("feedback/", RecommendationFeedbackView.as_view(), name="recommendation_feedback"),
]