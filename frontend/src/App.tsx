import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientDashboard from './pages/ClientDashboard';
import CoachDashboard from './pages/CoachDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApplyPage from './pages/ApplyPage';
import ProgramBuilderPage from './pages/ProgramBuilderPage';
import ProgramViewPage from './pages/ProgramViewPage';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'COACH') return <Navigate to="/coach" replace />;
  return <Navigate to="/client" replace />;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/apply/:slug" element={<ApplyPage />} />
        <Route
          path="/client"
          element={
            <ProtectedRoute roles={['CLIENT']}>
              <Layout><ClientDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/program/:id"
          element={
            <ProtectedRoute roles={['CLIENT']}>
              <Layout><ProgramViewPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach"
          element={
            <ProtectedRoute roles={['COACH']}>
              <Layout><CoachDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/program/:id"
          element={
            <ProtectedRoute roles={['COACH']}>
              <Layout><ProgramBuilderPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
