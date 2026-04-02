import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import StaffRoute from './auth/StaffRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import SavedJobs from './pages/SavedJobs';
import Recommendations from './pages/Recommendations';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import CV from './pages/CV';
import AdminDashboard from './pages/AdminDashboard';
import { ROUTES } from './utils/constants'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-x-hidden">
            <Routes>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
              <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
              
              <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} />} />
              
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path={ROUTES.JOBS}
                element={
                  <ProtectedRoute>
                    <Jobs />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path={ROUTES.SAVED_JOBS}
                element={
                  <ProtectedRoute>
                    <SavedJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.APPLICATIONS}
                element={
                  <ProtectedRoute>
                    <Applications />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.RECOMMENDATIONS}
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path={ROUTES.PROFILE}
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.CV}
                element={
                  <ProtectedRoute>
                    <CV />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN}
                element={
                  <StaffRoute>
                    <AdminDashboard />
                  </StaffRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;