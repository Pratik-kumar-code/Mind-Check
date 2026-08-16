import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';

const links = [['/admin', 'Dashboard'], ['/admin/users', 'Users'], ['/admin/appointments', 'Appointments'], ['/admin/assessments', 'Assessments'], ['/admin/reports', 'Reports'], ['/admin/settings', 'Settings']];
export default function AdminLayout() {
  const navigate = useNavigate();
  if (localStorage.getItem('adminLoggedIn') !== 'true' || !localStorage.getItem('adminAuthToken')) return <Navigate to="/admin/login" replace />;
  const logout = () => { localStorage.removeItem('adminLoggedIn'); localStorage.removeItem('adminAuthToken'); navigate('/admin/login'); };
  return <div className="admin-app"><aside className="admin-sidebar"><div className="admin-logo">MindWell</div><ul>{links.map(([to, label]) => <li key={to}><NavLink end={to === '/admin'} to={to}>{label}</NavLink></li>)}</ul></aside><main className="admin-main"><div className="admin-header"><h2>Admin Dashboard</h2><button className="logout" onClick={logout}>Logout</button></div><Outlet /></main></div>;
}
