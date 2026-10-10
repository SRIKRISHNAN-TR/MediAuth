import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Layouts
import { DoctorLayout } from './layouts/DoctorLayout';
import { PatientLayout } from './layouts/PatientLayout';
import { InsurerLayout } from './layouts/InsurerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Doctor pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { NewRequest } from './pages/doctor/NewRequest';
import { MyRequests } from './pages/doctor/MyRequests';
import { RequestDetail } from "./pages/doctor/RequestDetail";
import { DoctorDocuments } from "./pages/doctor/DoctorDocuments";
import { ProfilePage } from "./pages/shared/ProfilePage";
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { SettingsPage } from './pages/shared/SettingsPage';

// Patient pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { MyClaims } from "./pages/patient/MyClaims";
import { ClaimDetail } from './pages/patient/ClaimDetail';
import { PatientDocuments } from "./pages/patient/PatientDocuments";
import { SupportPage } from './pages/patient/SupportPage';

// Insurer pages
import { InsurerDashboard } from './pages/insurer/InsurerDashboard';
import { PendingReviews } from "./pages/insurer/PendingReviews";
import { AllClaims } from "./pages/insurer/AllClaims";
import { ReviewDetail } from "./pages/insurer/ReviewDetail";
import { AnalyticsPage } from './pages/insurer/AnalyticsPage';
import { InsurerDocuments } from "./pages/insurer/InsurerDocuments";
import { AIAnalysisPage } from './pages/insurer/AIAnalysisPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPendingPage } from './pages/admin/AdminPendingPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAddUserPage } from './pages/admin/AdminAddUserPage';

// ─── Route guards ────────────────────────────────────────────────────────────

type AllowedRole = 'doctor' | 'patient' | 'insurer' | 'admin';

const RoleRoute: React.FC<{ role: AllowedRole; children: React.ReactNode }> = ({ role, children }) => {
  const { role: userRole, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userRole !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
  if (role === 'patient') return <Navigate to="/patient/dashboard" replace />;
  if (role === 'insurer') return <Navigate to="/insurer/dashboard" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

// ─── App ─────────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Doctor */}
      <Route path="/doctor" element={<RoleRoute role="doctor"><DoctorLayout /></RoleRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="new-request" element={<NewRequest />} />
        <Route path="my-requests" element={<MyRequests />} />
        <Route path="request/:id" element={<RequestDetail />} />
        <Route path="documents" element={<DoctorDocuments />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Patient */}
      <Route path="/patient" element={<RoleRoute role="patient"><PatientLayout /></RoleRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="my-claims" element={<MyClaims />} />
        <Route path="claim/:id" element={<ClaimDetail />} />
        <Route path="documents" element={<PatientDocuments />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Insurer */}
      <Route path="/insurer" element={<RoleRoute role="insurer"><InsurerLayout /></RoleRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<InsurerDashboard />} />
        <Route path="pending" element={<PendingReviews />} />
        <Route path="all-claims" element={<AllClaims />} />
        <Route path="ai-analysis" element={<AIAnalysisPage />} />
        <Route path="review/:id" element={<ReviewDetail />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="documents" element={<InsurerDocuments />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<RoleRoute role="admin"><AdminLayout /></RoleRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="pending" element={<AdminPendingPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="add-user" element={<AdminAddUserPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
