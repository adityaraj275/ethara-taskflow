import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Zap } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '240px', background: '#0f172a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh' }}>
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '10px', padding: '8px' }}>
              <Zap size={18} color="white" />
            </div>
            <span style={{ fontWeight: '700', fontSize: '18px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TaskFlow</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Welcome, {user.name}</div>
          <div style={{ fontSize: '11px', color: '#4f46e5', textTransform: 'uppercase', fontWeight: '600' }}>{user.role}</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {[
            { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
            { to: '/projects', icon: <FolderKanban size={18} />, label: 'Projects' },
            { to: '/tasks', icon: <CheckSquare size={18} />, label: 'Tasks' },
          ].map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
              borderRadius: '8px', marginBottom: '4px', textDecoration: 'none',
              color: isActive ? '#a5b4fc' : '#64748b',
              background: isActive ? 'rgba(79,70,229,0.15)' : 'transparent',
              fontWeight: isActive ? '600' : '400', fontSize: '14px',
              transition: 'all 0.2s'
            })}>
              {icon}{label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1e293b' }}>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', width: '100%', fontSize: '14px' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px', minHeight: '100vh', background: '#0f172a' }}>
        <Outlet />
      </main>
    </div>
  )
}