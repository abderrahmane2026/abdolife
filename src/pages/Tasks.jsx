import { useState } from 'react'
import { CheckSquare, Plus, Trash2, X, Filter } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Tasks.css'

const PRIORITIES = ['high', 'medium', 'low']
const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Other']

function TaskModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(
    initial || { title: '', note: '', priority: 'medium', category: 'Personal', dueDate: '' }
  )

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <span className="modal-title">{initial ? 'Edit Task' : 'New Task'}</span>
          <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={onClose}>
            <X size={16} color="#FFFFFF" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="What needs to be done?" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Note</label>
            <textarea className="input" value={form.note} onChange={e => set('note', e.target.value)}
              placeholder="Add details..." rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent">
              <Plus size={14} color="#07070f" /> {initial ? 'Update' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useLocalStorage('tasks', [])
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')

  const addTask = (form) => {
    setTasks(t => [...t, { ...form, id: Date.now(), done: false, createdAt: new Date().toISOString() }])
  }

  const toggle = (id) => {
    setTasks(t => t.map(task => task.id === id ? { ...task, done: !task.done } : task))
  }

  const remove = (id) => {
    setTasks(t => t.filter(task => task.id !== id))
  }

  const filtered = tasks.filter(t => {
    const statusOk = filter === 'all' || (filter === 'done' ? t.done : !t.done)
    const catOk = catFilter === 'all' || t.category === catFilter
    return statusOk && catOk
  })

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.done).length,
    pending: tasks.filter(t => !t.done).length,
  }

  return (
    <div className="tasks-page fade-in">
      {showModal && <TaskModal onClose={() => setShowModal(false)} onSave={addTask} />}

      <div className="section-header">
        <h1 className="section-title">
          <CheckSquare size={24} className="section-title-icon" color="#C8F135" />
          Tasks
        </h1>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}>
          <Plus size={16} color="#07070f" /> New Task
        </button>
      </div>

      {/* Stats */}
      <div className="tasks-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--success)' }}>{stats.done}</span>
          <span className="stat-label">Done</span>
        </div>
        <div className="stat-card" style={{ background: 'var(--accent-dim)', borderColor: 'var(--accent-glow)' }}>
          <span className="stat-value" style={{ color: 'var(--accent)' }}>
            {stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%
          </span>
          <span className="stat-label">Complete</span>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="progress-bar" style={{ marginBottom: '20px' }}>
          <div className="progress-fill" style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }} />
        </div>
      )}

      {/* Filters */}
      <div className="tasks-filters">
        <div className="filter-group">
          <Filter size={14} color="#6B7280" />
          {['all', 'pending', 'done'].map(f => (
            <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <select className="input" style={{ padding: '6px 28px 6px 10px', fontSize: '13px' }}
            value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Task list */}
      <div className="task-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <CheckSquare size={48} color="#6B7280" />
            <p>{tasks.length === 0 ? 'No tasks yet. Add your first task!' : 'No tasks match your filter.'}</p>
          </div>
        ) : (
          filtered
            .sort((a, b) => {
              const pOrder = { high: 0, medium: 1, low: 2 }
              if (a.done !== b.done) return a.done ? 1 : -1
              return pOrder[a.priority] - pOrder[b.priority]
            })
            .map(task => (
              <TaskItem key={task.id} task={task} onToggle={toggle} onDelete={remove} />
            ))
        )}
      </div>
    </div>
  )
}

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`task-item card${task.done ? ' task-done' : ''}`}>
      <button
        className={`checkbox${task.done ? ' checked' : ''}`}
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.done && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#07070f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="task-content">
        <div className="task-header">
          <span className="task-title">{task.title}</span>
          <span className={`tag priority-tag-${task.priority}`}>{task.priority}</span>
        </div>
        {task.note && <p className="task-note">{task.note}</p>}
        <div className="task-meta">
          <span className="task-cat">{task.category}</span>
          {task.dueDate && (
            <span className={`task-due${isOverdue(task) ? ' overdue' : ''}`}>
              Due {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
      <button className="btn btn-danger task-delete" onClick={() => onDelete(task.id)}>
        <Trash2 size={14} color="#ff4d6d" />
      </button>
    </div>
  )
}

function isOverdue(task) {
  if (!task.dueDate || task.done) return false
  return new Date(task.dueDate) < new Date(new Date().toDateString())
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
