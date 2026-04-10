# Code Used - App Routing and Access Control

## Source files

- `frontend/src/App.jsx`
- `frontend/src/auth/ProtectedRoute.jsx`
- `frontend/src/auth/StaffRoute.jsx`

## 1) Main route registration

```javascript
<Route path={ROUTES.LOGIN} element={<Login />} />
<Route path={ROUTES.REGISTER} element={<Register />} />
<Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
<Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

<Route
  path={ROUTES.DASHBOARD}
  element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
/>
<Route
  path={ROUTES.RECOMMENDATIONS}
  element={<ProtectedRoute><Recommendations /></ProtectedRoute>}
/>
<Route
  path={ROUTES.ADMIN}
  element={<StaffRoute><AdminDashboard /></StaffRoute>}
/>
```

## 2) Protected route gate

```javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated() ? children : <Navigate to={ROUTES.LOGIN} />;
};
```

## 3) Staff-only route gate

```javascript
const StaffRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated()) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!user?.is_staff) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return children;
};
```
