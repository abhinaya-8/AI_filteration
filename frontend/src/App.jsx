import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard'
import AdminDriveDetail from './pages/AdminDriveDetail'
import UserDashboard from './pages/UserDashboard'
import UserCompanyDrives from './pages/UserCompanyDrives'
import ResumeBuilder from './pages/ResumeBuilder'
import KnowledgeChecker from './pages/KnowledgeChecker'
import MyApplications from './pages/MyApplications'

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/dashboard" replace />
  return children
}

function DashboardRouter() {
  const { user } = useAuth()
  return user?.role === 'Admin' ? <AdminDashboard /> : <UserDashboard />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path="admin/drives/:driveId" element={<ProtectedRoute adminOnly><AdminDriveDetail /></ProtectedRoute>} />
        <Route path="companies/:companyId/drives" element={<ProtectedRoute><UserCompanyDrives /></ProtectedRoute>} />
        <Route path="resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="knowledge-checker" element={<ProtectedRoute><KnowledgeChecker /></ProtectedRoute>} />
        <Route path="my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
