import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AIAdvisor from './pages/AIAdvisor';
import './App.css';

/* ── Auth context ───────────────────────────────────────────── */
export const AuthCtx = createContext(null);

export function useAuth() { return useContext(AuthCtx); }

function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem('fin_token') || '');
  const [user,  setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('fin_user') || 'null'); } catch { return null; }
  });

  const login = (tok, usr) => {
    setToken(tok); setUser(usr);
    localStorage.setItem('fin_token', tok);
    localStorage.setItem('fin_user', JSON.stringify(usr));
  };
  const logout = () => {
    setToken(''); setUser(null);
    localStorage.removeItem('fin_token');
    localStorage.removeItem('fin_user');
  };

  return (
    <AuthCtx.Provider value={{ token, user, login, logout, authed: !!token }}>
      {children}
    </AuthCtx.Provider>
  );
}

/* ── Sidebar ────────────────────────────────────────────────── */
function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = (user?.name || user?.email || 'U')[0].toUpperCase();

  const links = [
    { to: '/',             label: 'Dashboard',    icon: <GridIcon /> },
    { to: '/transactions', label: 'Transactions', icon: <SwapIcon /> },
    { to: '/ai-advisor',   label: 'AI Advisor',   icon: <BrainIcon /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-hex">
          <HexIcon />
        </div>
        <div>
          <span className="brand-name">FinanceAI</span>
          <span className="brand-tag">UBL Hackathon</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section">Menu</p>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            {l.icon}
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="user-row">
          <div className="user-av">{initial}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }} title="Sign out">
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── Protected layout ───────────────────────────────────────── */
function AppLayout() {
  const { authed } = useAuth();
  if (!authed) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route index          element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="ai-advisor"   element={<AIAdvisor />} />
        </Routes>
      </main>
    </div>
  );
}

/* ── Login page ─────────────────────────────────────────────── */
function Login() {
  const { login, authed } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [err, setErr]       = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (authed) navigate('/', { replace: true }); }, [authed, navigate]);

  const submit = async e => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
     const res = await fetch('http://localhost:4000/auth/login',  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Login failed');
      login(data.token || data.accessToken, data.user);
      navigate('/', { replace: true });
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><HexIcon size={28} /> <span>FinanceAI</span></div>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">UBL National Innovation Hackathon 2026</p>
        <form onSubmit={submit} className="auth-form" noValidate>
          {err && <div className="auth-err">{err}</div>}
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={set('email')} placeholder="ali@example.com" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
          </label>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="spin" /> : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">No account? <button onClick={() => navigate('/register')}>Create one</button></p>
      </div>
    </div>
  );
}

/* ── Register page ──────────────────────────────────────────── */
function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Registration failed');
      navigate('/login');
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><HexIcon size={28} /> <span>FinanceAI</span></div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Start tracking your finances with AI</p>
        <form onSubmit={submit} className="auth-form" noValidate>
          {err && <div className="auth-err">{err}</div>}
          <label className="field">
            <span>Full name</span>
            <input type="text" value={form.name} onChange={set('name')} placeholder="Ali Khan" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={set('email')} placeholder="ali@example.com" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required />
          </label>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="spin" /> : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">Have an account? <button onClick={() => navigate('/login')}>Sign in</button></p>
      </div>
    </div>
  );
}

/* ── Root ───────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*"        element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

/* ── Inline SVG icons (no dependency needed) ────────────────── */
function HexIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" fill="#3b82f6" />
      <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" stroke="#60a5fa" strokeWidth="0.5" fill="none" />
    </svg>
  );
}
function GridIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function SwapIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>;
}
function BrainIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5a4 4 0 00-4 4v1a4 4 0 004 4 4 4 0 004-4V9a4 4 0 00-4-4z"/><path d="M8 9H5a2 2 0 000 4h1"/><path d="M16 9h3a2 2 0 010 4h-1"/><path d="M9 18v1a3 3 0 006 0v-1"/></svg>;
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
}