import { NavLink, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EmergencyHelp from '../user/EmergencyHelp';

const links = [['/dashboard', 'Dashboard'], ['/journal', 'Journal'], ['/resources', 'Resources'], ['/therapists', 'Find a Therapist'], ['/profile', 'Profile'], ['/history', 'Assessment History'], ['/feedback', 'Feedback']];
function ThemeToggle() { const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark'); useEffect(() => { document.body.classList.toggle('dark-mode', dark); localStorage.setItem('theme', dark ? 'dark' : 'light'); }, [dark]); return <button className="theme" onClick={() => setDark(!dark)}>{dark ? 'Dark Mode' : 'Day Mode'}</button>; }
export function UserNavbar() { return <header><NavLink className="logo" to="/dashboard">MindWell</NavLink><nav>{links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav><div className="controls"><ThemeToggle /><EmergencyHelp /></div></header>; }
export default function UserLayout({ children }) { return localStorage.getItem('isLoggedIn') === 'true' ? <><UserNavbar />{children}</> : <Navigate to="/login" replace />; }
