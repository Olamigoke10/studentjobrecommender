from django.urls import path
from .views import JobListView, FetchJobsView

urlpatterns = [
    path("", JobListView.as_view(), name="job_list"),
    path("fetch/", FetchJobsView.as_view(), name="fetch_jobs"),
    
    path
]