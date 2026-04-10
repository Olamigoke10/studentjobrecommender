# Code Used - Recommendations

## Source files

- `frontend/src/api/recommendations.api.js`
- `frontend/src/pages/Recommendations.jsx`
- `student-job-recommender/backend/recommendations/views.py`
- `student-job-recommender/backend/recommendations/urls.py`

## 1) Frontend recommendation API

```javascript
export const recommendationsAPI = {
  getRecommendations: () => axiosInstance.get('/api/recommendations/'),
  submitNotInterested: (jobId) =>
    axiosInstance.post('/api/recommendations/feedback/', { job_id: jobId }),
};
```

## 2) Frontend recommendations page actions

```javascript
const loadRecommendations = async () => {
  const response = await recommendationsAPI.getRecommendations();
  setJobs(response.data);
};

const handleNotInterested = async (jobId) => {
  await recommendationsAPI.submitNotInterested(jobId);
  setJobs((prev) => prev.filter((j) => j.id !== jobId));
};
```

## 3) Backend matching logic (scoring + reasons + tiers)

```python
for job in qs:
    score = 0
    reasons = []

    if preferred_location and preferred_location.lower() in (job.location or "").lower():
        score += 2
        reasons.append(f"Matches preferred location: {preferred_location}")

    if preferred_job_type and (job.job_type or "").lower() == preferred_job_type.lower():
        score += 3
        reasons.append(f"Matches preferred job type: {preferred_job_type}")

    matched_skills = []
    blob = f"{job.title or ''} {job.description or ''} {job.company or ''}".lower()
    for s in skill_names:
        if s.lower() in blob:
            matched_skills.append(s)

    if matched_skills:
        score += min(len(matched_skills), 5)
        reasons.append("Matches your skills: " + ", ".join(matched_skills))

    if score > 0:
        job.match_score = score
        job.match_percent = min(100, round(100 * score / max_possible))
        job.match_tier = _match_tier_from_percent(job.match_percent)
        job.recommended_reason = reasons
        results.append(job)
```

## 4) Backend "not interested" feedback

```python
class RecommendationFeedbackView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        student = get_object_or_404(StudentProfile, user=request.user)
        job_id = request.data.get("job_id")
        if not job_id:
            return Response({"job_id": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
        job = get_object_or_404(Job, id=job_id)
        JobFeedback.objects.update_or_create(
            student=student,
            job=job,
            defaults={"feedback_type": JobFeedback.NOT_INTERESTED},
        )
        return Response({"ok": True}, status=status.HTTP_200_OK)
```

## 5) Recommendation routes

```python
urlpatterns = [
    path("", RecommendedJobsView.as_view(), name="recommended_jobs"),
    path("feedback/", RecommendationFeedbackView.as_view(), name="recommendation_feedback"),
]
```
