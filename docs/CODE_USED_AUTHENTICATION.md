# Code Used - Authentication

## Source files

- `frontend/src/api/auth.api.js`
- `frontend/src/utils/token.js`
- `frontend/src/api/axios.js`
- `frontend/src/auth/AuthContext.jsx`
- `frontend/src/auth/ProtectedRoute.jsx`
- `frontend/src/auth/StaffRoute.jsx`
- `student-job-recommender/backend/users/urls.py`
- `student-job-recommender/backend/users/views.py`

## 1) Frontend auth API

```javascript
export const authAPI = {
  login: (email, password) => axiosInstance.post('/api/users/login/', { email, password }),
  register: (userData) => axiosInstance.post('/api/users/register/', userData),
  requestPasswordReset: (email) => axiosInstance.post('/api/users/password-reset/', { email }),
  confirmPasswordReset: ({ uid, token, new_password }) =>
    axiosInstance.post('/api/users/password-reset/confirm/', { uid, token, new_password }),
  refreshToken: (refresh) => axiosInstance.post('/api/users/token/refresh/', { refresh }),
  getProfile: () => axiosInstance.get('/api/users/me/'),
};
```

## 2) Token storage

```javascript
export const TokenService = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setTokens: (access, refresh) => {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  },
  removeTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  isAuthenticated: () => !!localStorage.getItem('access_token'),
};
```

## 3) Request interceptor + refresh on 401

```javascript
axiosInstance.interceptors.request.use((config) => {
  const token = TokenService.getAccessToken();
  const url = config.url || "";
  const isAuthEndpoint =
    url.includes("/api/users/login/") ||
    url.includes("/api/users/register/") ||
    url.includes("/api/users/token/refresh/");

  if (token && !isAuthEndpoint) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = TokenService.getRefreshToken();
      if (!refreshToken) {
        TokenService.removeTokens();
        return Promise.reject(error);
      }
      const refreshResponse = await axios.post(`${API_BASE_URL}/api/users/token/refresh/`, { refresh: refreshToken });
      const { access } = refreshResponse.data;
      TokenService.setTokens(access, refreshToken);
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

## 4) Auth context login/logout

```javascript
const login = useCallback(async (email, password) => {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const response = await authAPI.login(normalizedEmail, password);
  const access = response.data.access;
  const refresh = response.data.refresh;
  TokenService.setTokens(access, refresh);
  axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  const userResponse = await authAPI.getProfile();
  setUser(userResponse.data);
  return { success: true };
}, []);

const logout = useCallback(() => {
  TokenService.removeTokens();
  setUser(null);
}, []);
```

## 5) Protected routes

```javascript
// ProtectedRoute.jsx
return isAuthenticated() ? children : <Navigate to={ROUTES.LOGIN} />;
```

```javascript
// StaffRoute.jsx
if (!isAuthenticated()) return <Navigate to={ROUTES.LOGIN} replace />;
if (!user?.is_staff) return <Navigate to={ROUTES.DASHBOARD} replace />;
return children;
```

## 6) Backend auth endpoints

```python
urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", StudentProfileView.as_view(), name="student_profile"),
]
```

## 7) Backend password reset confirmation

```python
class PasswordResetConfirmView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid_b64 = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        uid = force_str(urlsafe_base64_decode(uid_b64))
        user = User.objects.get(pk=uid)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired reset link. Please request a new one."}, status=400)

        validate_password(new_password, user=user)
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Your password has been reset. You can sign in now."}, status=200)
```
