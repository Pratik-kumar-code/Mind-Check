const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
// VITE_API_BASE_URL is injected by Netlify at build time. The deployed Render
// hostname is confirmed in the Render dashboard; a render.yaml service name is
// not necessarily the same as its public hostname.
export const API_BASE_URL = (configuredBaseUrl || (local ? 'http://localhost:5000' : 'https://mind-check-27vi.onrender.com')).trim().replace(/\/$/, '');
export async function api(path, options = {}, timeout = 45000) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeout);
  const isAdminRequest = path.startsWith('/admin/') || path.startsWith('/api/admin/');
  const token = localStorage.getItem(isAdminRequest ? 'adminAuthToken' : 'userAuthToken');
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  try {
    return await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, { ...options, headers, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The server is taking too long to respond. Please try again.');
    throw new Error('Unable to reach MindWell. Check your connection and try again.');
  }
  finally { clearTimeout(timer); }
}
export const jsonOptions = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
