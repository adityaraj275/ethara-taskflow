import { useEffect, useState } from 'react'
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
}