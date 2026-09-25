import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const icons = { Dashboard: '⌘', Users: '♧', Appointments: '□', Assessments: '▤', Reports: '▥', Settings: '⚙', Logout: '↪' };
const links = [['/admin', 'Dashboard'], ['/admin/users', 'Users'], ['/admin/appointments', 'Appointments'], ['/admin/assessments', 'Assessments'], ['/admin/reports', 'Reports'], ['/admin/settings', 'Settings']];
export default function AdminLayout() {
  const navigate = useNavigate(), location = useLocation(), [menuOpen, setMenuOpen] = useState(false);
  if (localStorage.getItem('adminLoggedIn') !== 'true' || !localStorage.getItem('adminAuthToken')) return <Navigate to="/admin/login" replace />;
  const logout = () => { localStorage.removeItem('adminLoggedIn'); localStorage.removeItem('adminAuthToken'); navigate('/admin/login'); };
  const pageName = links.find(([to]) => location.pathname === to)?.[1] || 'Admin Panel';
  return <div className="admin-app">
    <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Admin navigation">
      <NavLink className="admin-logo" to="/admin" onClick={() => setMenuOpen(false)}><span className="logo-mark">✦</span><span>MindWell<small>Better mind · Brighter you</small></span></NavLink>
      <nav className="admin-nav">{links.map(([to, label]) => <NavLink end={to === '/admin'} to={to} key={to} onClick={() => setMenuOpen(false)}><span className="nav-icon">{icons[label]}</span>{label}</NavLink>)}</nav>
      <div className="sidebar-wellness"><span>✦</span><p>Small steps build a healthier tomorrow.</p></div>
    </aside>
    {menuOpen && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    <main className="admin-main"><header className="admin-header"><button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>☰</button><div className="admin-heading"><p className="eyebrow">{pageName}</p><h1>{location.pathname === '/admin' ? 'Good morning, Admin 👋' : pageName}</h1><span>{location.pathname === '/admin' ? "Here’s what’s happening with your MindWell platform today." : 'Manage your MindWell platform with confidence.'}</span></div><div className="header-actions"><div className="header-date"><span>▣</span><small>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</small></div><div className="admin-avatar" aria-label="Administrator">A</div><button className="logout" onClick={logout}><span>{icons.Logout}</span> Logout</button></div></header><div className="admin-content"><Outlet /></div></main>
  </div>;
}
