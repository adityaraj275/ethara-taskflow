const fs = require('fs');
const path = require('path');

const files = {

'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)`,

'src/index.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #1e293b; }
::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 3px; }`,

'src/api.js': `import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:5000/api' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
export default api;`,

'src/App.jsx': `import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Layout from './components/Layout'

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}`,

'src/components/Layout.jsx': `import { Outlet, NavLink, useNavigate } from 'react-router-dom'
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
}`,

'src/pages/Login.jsx': `import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { Zap } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('All fields required')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px', border: '1px solid #334155', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
            <Zap size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>TaskFlow</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Sign in to your account</p>
        </div>
        <form onSubmit={submit}>
          {[{ label: 'Email', key: 'email', type: 'email' }, { label: 'Password', key: 'password', type: 'password' }].map(({ label, key, type }) => (
            <div key={key} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }}
                placeholder={'Enter your ' + label.toLowerCase()} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
          No account? <Link to="/register" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
        </p>
      </div>
    </div>
  )
}`,

'src/pages/Register.jsx': `import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { Zap } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('All fields required')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px', border: '1px solid #334155', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
            <Zap size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Create Account</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Join TaskFlow today</p>
        </div>
        <form onSubmit={submit}>
          {[{ label: 'Full Name', key: 'name', type: 'text' }, { label: 'Email', key: 'email', type: 'email' }, { label: 'Password', key: 'password', type: 'password' }].map(({ label, key, type }) => (
            <div key={key} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }}
                placeholder={'Enter your ' + label.toLowerCase()} />
            </div>
          ))}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
          Have account? <Link to="/login" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}`,

'src/pages/Dashboard.jsx': `import { useEffect, useState } from 'react'
import api from '../api'
import { FolderKanban, CheckSquare, Clock, PlayCircle, CheckCircle2, TrendingUp } from 'lucide-react'

const Card = ({ icon, label, value, color }) => (
  <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ background: color + '20', borderRadius: '10px', padding: '12px' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{label}</div>
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProjects: 0, totalTasks: 0, todo: 0, inProgress: 0, done: 0 })
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    api.get('/dashboard').then(r => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Welcome back, {user.name}! Here's your overview.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <Card icon={<FolderKanban size={22} color="#4f46e5" />} label="Total Projects" value={stats.totalProjects} color="#4f46e5" />
        <Card icon={<CheckSquare size={22} color="#0ea5e9" />} label="Total Tasks" value={stats.totalTasks} color="#0ea5e9" />
        <Card icon={<Clock size={22} color="#f59e0b" />} label="To Do" value={stats.todo} color="#f59e0b" />
        <Card icon={<PlayCircle size={22} color="#8b5cf6" />} label="In Progress" value={stats.inProgress} color="#8b5cf6" />
        <Card icon={<CheckCircle2 size={22} color="#10b981" />} label="Done" value={stats.done} color="#10b981" />
      </div>
      <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <TrendingUp size={18} color="#4f46e5" />
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>Task Progress</h2>
        </div>
        {stats.totalTasks === 0 ? (
          <p style={{ color: '#64748b', fontSize: '14px' }}>No tasks yet. Create your first project and task!</p>
        ) : (
          <div>
            {[
              { label: 'To Do', value: stats.todo, total: stats.totalTasks, color: '#f59e0b' },
              { label: 'In Progress', value: stats.inProgress, total: stats.totalTasks, color: '#8b5cf6' },
              { label: 'Done', value: stats.done, total: stats.totalTasks, color: '#10b981' },
            ].map(({ label, value, total, color }) => (
              <div key={label} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{value}/{total}</span>
                </div>
                <div style={{ background: '#0f172a', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: (value / total * 100) + '%', background: color, height: '100%', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}`,

'src/pages/Projects.jsx': `import { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus, FolderKanban, Trash2, X } from 'lucide-react'

const statusColors = { active: '#10b981', completed: '#4f46e5', 'on-hold': '#f59e0b' }

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', status: 'active' })
  const [loading, setLoading] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const load = () => api.get('/projects').then(r => setProjects(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name) return toast.error('Project name required')
    setLoading(true)
    try {
      await api.post('/projects', form)
      toast.success('Project created!')
      setShowModal(false)
      setForm({ name: '', description: '', status: 'active' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setLoading(false) }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this project?')) return
    try { await api.delete('/projects/' + id); toast.success('Deleted'); load() }
    catch { toast.error('Cannot delete') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Projects</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>{projects.length} projects total</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
          <FolderKanban size={48} color="#334155" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b' }}>No projects yet. Create your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {projects.map(p => (
            <div key={p._id} style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(79,70,229,0.15)', borderRadius: '8px', padding: '8px' }}>
                    <FolderKanban size={16} color="#4f46e5" />
                  </div>
                  <h3 style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '15px' }}>{p.name}</h3>
                </div>
                {user.role === 'admin' && (
                  <button onClick={() => del(p._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px', minHeight: '20px' }}>{p.description || 'No description'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '999px', background: statusColors[p.status] + '20', color: statusColors[p.status], fontWeight: '600', textTransform: 'capitalize' }}>{p.status}</span>
                <span style={{ fontSize: '12px', color: '#475569' }}>by {p.owner?.name || 'You'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>New Project</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={submit}>
              {[{ label: 'Project Name', key: 'name', type: 'text' }, { label: 'Description', key: 'description', type: 'text' }].map(({ label, key, type }) => (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }}
                    placeholder={label} />
                </div>
              ))}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}`,

'src/pages/Tasks.jsx': `import { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus, CheckSquare, Trash2, X, Calendar } from 'lucide-react'

const priorityColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' }
const statusColors = { todo: '#64748b', 'in-progress': '#8b5cf6', done: '#10b981' }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', project: '', priority: 'medium', status: 'todo', dueDate: '' })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const load = () => {
    api.get('/tasks').then(r => setTasks(r.data)).catch(() => {})
    api.get('/projects').then(r => setProjects(r.data)).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.project) return toast.error('Title and project required')
    setLoading(true)
    try {
      await api.post('/tasks', form)
      toast.success('Task created!')
      setShowModal(false)
      setForm({ title: '', description: '', project: '', priority: 'medium', status: 'todo', dueDate: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setLoading(false) }
  }

  const updateStatus = async (id, status) => {
    try { await api.put('/tasks/' + id, { status }); load() }
    catch { toast.error('Error updating') }
  }

  const del = async (id) => {
    try { await api.delete('/tasks/' + id); toast.success('Deleted'); load() }
    catch { toast.error('Cannot delete') }
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Tasks</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>{tasks.length} tasks total</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
          <Plus size={16} /> New Task
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'todo', 'in-progress', 'done'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 14px', borderRadius: '999px', border: '1px solid', borderColor: filter === s ? '#4f46e5' : '#334155', background: filter === s ? 'rgba(79,70,229,0.15)' : 'transparent', color: filter === s ? '#a5b4fc' : '#64748b', fontSize: '13px', cursor: 'pointer', textTransform: 'capitalize' }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
          <CheckSquare size={48} color="#334155" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b' }}>No tasks found. Create your first task!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(t => (
            <div key={t._id} style={{ background: '#1e293b', borderRadius: '12px', padding: '16px 20px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '15px' }}>{t.title}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: priorityColors[t.priority] + '20', color: priorityColors[t.priority], fontWeight: '600', textTransform: 'capitalize' }}>{t.priority}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {t.project && <span style={{ fontSize: '12px', color: '#4f46e5' }}>📁 {t.project.name}</span>}
                  {t.dueDate && <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> {new Date(t.dueDate).toLocaleDateString()}</span>}
                  {t.assignedTo && <span style={{ fontSize: '12px', color: '#64748b' }}>👤 {t.assignedTo.name}</span>}
                </div>
              </div>
              <select value={t.status} onChange={e => updateStatus(t._id, e.target.value)}
                style={{ padding: '6px 10px', background: statusColors[t.status] + '20', border: '1px solid ' + statusColors[t.status], borderRadius: '6px', color: statusColors[t.status], fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none' }}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button onClick={() => del(t._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px', border: '1px solid #334155', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>New Task</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={submit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Task Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }} placeholder="Task title" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Project *</label>
                <select value={form.project} onChange={e => setForm({ ...form, project: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }}>
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }} placeholder="Optional description" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}`

};

let count = 0;
for (const [filePath, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ ' + filePath);
  count++;
}
console.log('\n✅ Done! ' + count + ' files created.');
console.log('Now run: npm run dev');
