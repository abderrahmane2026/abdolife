import { useState } from 'react'
import { FolderKanban, Plus, Trash2, X, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Projects.css'

const STATUSES = ['planning', 'active', 'paused', 'done']

function ProjectModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(
    initial || { name: '', description: '', status: 'active', color: '#C8F135', deadline: '', tasks: [] }
  )
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const COLORS = ['#C8F135', '#47b8ff', '#4dffb4', '#ff4d6d', '#ffb347', '#b847ff', '#ff47e6', '#47ffff']

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <span className="modal-title">{initial ? 'Edit Project' : 'New Project'}</span>
          <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Project name" autoFocus required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="input" value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="What is this project about?" rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input className="input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {COLORS.map(c => (
                <button key={c} type="button" className={`color-swatch${form.color === c ? ' selected' : ''}`}
                  style={{ background: c }} onClick={() => set('color', c)} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent"><Plus size={14} /> {initial ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Projects() {
  const [projects, setProjects] = useLocalStorage('projects', [])
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [newTask, setNewTask] = useState({})

  const addProject = (form) => {
    setProjects(p => [...p, { ...form, id: Date.now(), tasks: [], createdAt: new Date().toISOString() }])
  }

  const removeProject = (id) => setProjects(p => p.filter(proj => proj.id !== id))

  const updateProject = (id, updates) => {
    setProjects(p => p.map(proj => proj.id === id ? { ...proj, ...updates } : proj))
  }

  const addTask = (projectId) => {
    const text = newTask[projectId]?.trim()
    if (!text) return
    setProjects(p => p.map(proj =>
      proj.id === projectId
        ? { ...proj, tasks: [...(proj.tasks || []), { id: Date.now(), text, done: false }] }
        : proj
    ))
    setNewTask(n => ({ ...n, [projectId]: '' }))
  }

  const toggleTask = (projectId, taskId) => {
    setProjects(p => p.map(proj =>
      proj.id === projectId
        ? { ...proj, tasks: proj.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
        : proj
    ))
  }

  const removeTask = (projectId, taskId) => {
    setProjects(p => p.map(proj =>
      proj.id === projectId
        ? { ...proj, tasks: proj.tasks.filter(t => t.id !== taskId) }
        : proj
    ))
  }

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    done: projects.filter(p => p.status === 'done').length,
  }

  return (
    <div className="projects-page fade-in">
      {showModal && <ProjectModal onClose={() => setShowModal(false)} onSave={addProject} />}

      <div className="section-header">
        <h1 className="section-title">
          <FolderKanban size={24} className="section-title-icon" />
          Projects
        </h1>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      <div className="tasks-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--info)' }}>{stats.active}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--success)' }}>{stats.done}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={48} />
          <p>No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div className="project-list">
          {projects.map(project => {
            const tasks = project.tasks || []
            const doneTasks = tasks.filter(t => t.done).length
            const progress = tasks.length ? (doneTasks / tasks.length) * 100 : 0
            const isOpen = expanded === project.id

            return (
              <div key={project.id} className="project-card card">
                <div className="project-top-bar" style={{ background: project.color }} />
                <div className="project-header" onClick={() => setExpanded(isOpen ? null : project.id)}>
                  <div className="project-icon" style={{ background: project.color + '22', color: project.color }}>
                    <FolderKanban size={18} />
                  </div>
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    {project.description && <div className="project-desc">{project.description}</div>}
                    <div className="project-meta">
                      <span className={`tag status-${project.status}`}>{project.status}</span>
                      {project.deadline && <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Due {formatDate(project.deadline)}</span>}
                      {tasks.length > 0 && <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{doneTasks}/{tasks.length} tasks</span>}
                    </div>
                    {tasks.length > 0 && (
                      <div className="progress-bar" style={{ marginTop: '8px' }}>
                        <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${project.color}, ${project.color}88)` }} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button className="btn btn-danger" style={{ padding: '6px' }}
                      onClick={e => { e.stopPropagation(); removeProject(project.id) }}>
                      <Trash2 size={14} />
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '6px' }}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="project-tasks slide-in">
                    <div className="project-tasks-header">Milestones & Tasks</div>
                    <div className="project-task-list">
                      {tasks.map(task => (
                        <div key={task.id} className={`project-task${task.done ? ' done' : ''}`}>
                          <button className={`checkbox${task.done ? ' checked' : ''}`}
                            onClick={() => toggleTask(project.id, task.id)}>
                            {task.done && <CheckCircle2 size={10} />}
                          </button>
                          <span className="project-task-text">{task.text}</span>
                          <button className="btn btn-danger" style={{ padding: '4px', opacity: 0.7 }}
                            onClick={() => removeTask(project.id, task.id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="project-add-task">
                      <input className="input" placeholder="Add a task..." value={newTask[project.id] || ''}
                        onChange={e => setNewTask(n => ({ ...n, [project.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addTask(project.id)} />
                      <button className="btn btn-accent" onClick={() => addTask(project.id)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>Status</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {STATUSES.map(s => (
                          <button key={s} className={`filter-btn${project.status === s ? ' active' : ''}`}
                            onClick={() => updateProject(project.id, { status: s })}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
