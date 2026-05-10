import { useEffect, useState } from 'react'
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
}