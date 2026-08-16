import { Navigate, Route, Routes } from 'react-router-dom';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import { AdminLogin } from './pages/admin/AdminPages';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import UserDetails from './pages/admin/UserDetails';
import UserJournals from './pages/admin/UserJournals';
import JournalDetails from './pages/admin/JournalDetails';
import AdminAppointments from './pages/admin/Appointments';
import AppointmentDetails from './pages/admin/AppointmentDetails';
import Assessments from './pages/admin/Assessments';
import AssessmentDetails from './pages/admin/AssessmentDetails';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

import { AppointmentSuccess, Appointments, AssessmentHistory, AuthPage, Feedback, Journal, Profile, Resources, Therapists, UserDashboard } from './pages/user/UserPages';

const userRoutes = [['/dashboard', <UserDashboard />], ['/journal', <Journal />], ['/resources', <Resources />], ['/therapists', <Therapists />], ['/appointments', <Appointments />], ['/appointment-success', <AppointmentSuccess />], ['/history', <AssessmentHistory />], ['/feedback', <Feedback />], ['/profile', <Profile />]];
export default function App() { return <Routes><Route path="/" element={<Navigate to="/login" replace />} /><Route path="/login" element={<AuthPage />} /><Route path="/register" element={<AuthPage register />} /><Route path="/admin/login" element={<AdminLogin />} /><Route path="/admin" element={<AdminLayout />}><Route index element={<AdminDashboard />} /><Route path="users" element={<Users />} /><Route path="users/:id" element={<UserDetails />} /><Route path="journals/:id" element={<UserJournals />} /><Route path="journals/detail/:id" element={<JournalDetails />} /><Route path="appointments" element={<AdminAppointments />} /><Route path="appointments/:id" element={<AppointmentDetails />} /><Route path="assessments" element={<Assessments />} /><Route path="assessments/:id" element={<AssessmentDetails />} /><Route path="reports" element={<Reports />} /><Route path="settings" element={<Settings />} /></Route>{userRoutes.map(([path, element]) => <Route key={path} path={path} element={<UserLayout>{element}</UserLayout>} />)}<Route path="*" element={<Navigate to="/login" replace />} /></Routes>; }
