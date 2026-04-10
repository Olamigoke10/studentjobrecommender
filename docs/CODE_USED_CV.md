# Code Used - CV Builder and AI Features

## Source files

- `frontend/src/pages/CV.jsx`
- `frontend/src/api/auth.api.js`
- `student-job-recommender/backend/users/views.py`

## 1) Frontend CV load/save

```javascript
const loadCV = async () => {
  const res = await authAPI.getCV();
  const d = res.data;
  setSummary(d.summary || '');
  setEducation((d.education && d.education.length) ? d.education : [emptyEducation()]);
  setExperience((d.experience && d.experience.length) ? d.experience : [emptyExperience()]);
};

const handleSave = async (e) => {
  e.preventDefault();
  await authAPI.updateCV({
    summary,
    education: education.filter(e => e.institution || e.degree || e.subject),
    experience: experience.filter(x => x.company || x.role),
  });
};
```

## 2) Frontend AI summary + PDF import

```javascript
const handleGenerateSummary = async () => {
  const res = await authAPI.generateCVSummary({
    education: education.filter(e => e.institution || e.degree || e.subject),
    experience: experience.filter(x => x.company || x.role),
    current_summary: summary || undefined,
  });
  setAiGeneratedSummary(res.data.summary || '');
};

const handlePdfSelected = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const res = await authAPI.parseCVPdf(file);
  // map response into education/experience/summary in state
};
```

## 3) Backend CV CRUD endpoint

```python
class CVView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(StudentProfile, user=request.user)
        education = Education.objects.filter(student=profile)
        experience = Experience.objects.filter(student=profile)
        return Response({
            "summary": profile.cv_summary or "",
            "education": EducationSerializer(education, many=True).data,
            "experience": ExperienceSerializer(experience, many=True).data,
        })

    def put(self, request):
        profile = get_object_or_404(StudentProfile, user=request.user)
        profile.cv_summary = (request.data.get("summary", "") or "").strip()
        profile.save()
        # rewrite education + experience rows
        return Response({"summary": profile.cv_summary or ""}, status=status.HTTP_200_OK)
```

## 4) Backend AI summary endpoint

```python
class CVAISummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        education_data = request.data.get("education") or []
        experience_data = request.data.get("experience") or []
        current_summary = (request.data.get("current_summary") or "").strip()
        summary = generate_cv_summary_text(
            context=_build_cv_context(education_data, experience_data),
            job_context="",
            current_summary=current_summary,
        )
        return Response({"summary": summary}, status=status.HTTP_200_OK)
```
