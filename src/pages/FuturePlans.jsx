import { useState } from 'react'
import { Star, Plus, Trash2, X, Rocket, Heart, BookOpen, Globe, Trophy } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './FuturePlans.css'

const CATEGORIES = [
  { id: 'career',    label: 'Career',    icon: Rocket,    color: '#47b8ff' },
  { id: 'personal',  label: 'Personal',  icon: Heart,     color: '#ff4d6d' },
  { id: 'learning',  label: 'Learning',  icon: BookOpen,  color: '#C8F135' },
  { id: 'travel',    label: 'Travel',    icon: Globe,     color: '#4dffb4' },
  { id: 'goals',     label: 'Goals',     icon: Trophy,    color: '#ffb347' },
]

const HORIZONS = [
  { id: '1y',  label: '1 Year' },
  { id: '3y',  label: '3 Years' },
  { id: '5y',  label: '5 Years' },
  { id: '10y', label: '10 Years' },
  { id: 'life', label: 'Lifetime' },
]

function PlanModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'goals', horizon: '1y', priority: 'medium', achieved: false,
  })
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
          <span className="modal-title">Add Future Plan</span>
          <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Dream / Goal *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="What do you dream of achieving?" autoFocus required />
          </div>
          <div className="form-group">
            <label className="form-label">Details</label>
            <textarea className="input" value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe your vision..." rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Time Horizon</label>
              <select className="input" value={form.horizon} onChange={e => set('horizon', e.target.value)}>
                {HORIZONS.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
              {['high', 'medium', 'low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent"><Star size={14} /> Add Plan</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function FuturePlans() {
  const [plans, setPlans] = useLocalStorage('futureplans', [])
  const [showModal, setShowModal] = useState(false)
  const [filterCat, setFilterCat] = useState('all')
  const [filterHorizon, setFilterHorizon] = useState('all')

  const addPlan = (form) => {
    setPlans(p => [...p, { ...form, id: Date.now(), createdAt: new Date().toISOString() }])
  }

  const toggleAchieved = (id) => {
    setPlans(p => p.map(plan => plan.id === id ? { ...plan, achieved: !plan.achieved } : plan))
  }

  const remove = (id) => setPlans(p => p.filter(plan => plan.id !== id))

  const filtered = plans.filter(p => {
    const catOk = filterCat === 'all' || p.category === filterCat
    const horizonOk = filterHorizon === 'all' || p.horizon === filterHorizon
    return catOk && horizonOk
  })

  const achieved = filtered.filter(p => p.achieved).length
  const total = filtered.length

  const grouped = HORIZONS.reduce((acc, h) => {
    const hPlans = filtered.filter(p => p.horizon === h.id && !p.achieved)
    if (hPlans.length || filterHorizon === h.id) acc.push({ ...h, plans: hPlans })
    return acc
  }, [])

  const achievedPlans = filtered.filter(p => p.achieved)

  return (
    <div className="plans-page fade-in">
      {showModal && <PlanModal onClose={() => setShowModal(false)} onSave={addPlan} />}

      <div className="section-header">
        <h1 className="section-title">
          <Star size={24} className="section-title-icon" />
          Future Plans
        </h1>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Plan
        </button>
      </div>

      {/* Vision header */}
      <div className="vision-banner glass" style={{ marginBottom: '24px' }}>
        <div className="vision-text">
          <div className="vision-title">Your Life Vision</div>
          <div className="vision-sub">
            {total === 0
              ? 'Start mapping your future. Every great journey begins with a dream.'
              : `${achieved} of ${total} dreams achieved · ${total - achieved} still to conquer`}
          </div>
        </div>
        {total > 0 && (
          <div className="vision-progress">
            <div className="vision-pct">{Math.round((achieved / total) * 100)}%</div>
            <div className="progress-bar" style={{ width: '100px' }}>
              <div className="progress-fill" style={{ width: `${(achieved / total) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Category filters */}
      <div className="plans-filters">
        <div className="filter-group" style={{ flexWrap: 'wrap' }}>
          <button className={`filter-btn${filterCat === 'all' ? ' active' : ''}`} onClick={() => setFilterCat('all')}>All</button>
          {CATEGORIES.map(c => {
            const Icon = c.icon
            return (
              <button key={c.id} className={`filter-btn cat-btn${filterCat === c.id ? ' active' : ''}`}
                style={filterCat === c.id ? { borderColor: c.color, color: c.color, background: c.color + '20' } : {}}
                onClick={() => setFilterCat(v => v === c.id ? 'all' : c.id)}>
                <Icon size={12} /> {c.label}
              </button>
            )
          })}
        </div>
        <div className="filter-group">
          <select className="input" style={{ padding: '6px 28px 6px 10px', fontSize: '13px', width: 'auto' }}
            value={filterHorizon} onChange={e => setFilterHorizon(e.target.value)}>
            <option value="all">All Horizons</option>
            {HORIZONS.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
          </select>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: '80px' }}>
          <Star size={64} />
          <p>No plans yet. Start dreaming big!</p>
          <button className="btn btn-accent" onClick={() => setShowModal(true)}><Plus size={14} /> Add Your First Dream</button>
        </div>
      ) : (
        <>
          {/* Grouped by horizon */}
          {grouped.filter(g => g.plans.length > 0 || filterHorizon === g.id).map(group => (
            group.plans.length === 0 ? null : (
              <div key={group.id} className="horizon-group">
                <div className="horizon-label">
                  <div className="horizon-line" />
                  <span>{group.label}</span>
                  <div className="horizon-line" />
                </div>
                <div className="plan-grid">
                  {group.plans
                    .sort((a, b) => { const o = { high: 0, medium: 1, low: 2 }; return o[a.priority] - o[b.priority] })
                    .map(plan => <PlanCard key={plan.id} plan={plan} onToggle={toggleAchieved} onDelete={remove} />)
                  }
                </div>
              </div>
            )
          ))}

          {/* Achieved */}
          {achievedPlans.length > 0 && (
            <div className="horizon-group">
              <div className="horizon-label">
                <div className="horizon-line" />
                <span style={{ color: 'var(--success)' }}>Achieved</span>
                <div className="horizon-line" />
              </div>
              <div className="plan-grid">
                {achievedPlans.map(plan => <PlanCard key={plan.id} plan={plan} onToggle={toggleAchieved} onDelete={remove} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PlanCard({ plan, onToggle, onDelete }) {
  const cat = CATEGORIES.find(c => c.id === plan.category) || CATEGORIES[4]
  const Icon = cat.icon

  return (
    <div className={`plan-card card${plan.achieved ? ' achieved' : ''}`}>
      <div className="plan-card-top">
        <div className="plan-cat-icon" style={{ background: cat.color + '20', color: cat.color }}>
          <Icon size={16} />
        </div>
        <div className="plan-actions">
          <button className={`btn${plan.achieved ? ' btn-ghost' : ' btn-ghost'} achieve-btn`}
            style={plan.achieved ? { color: 'var(--success)', borderColor: 'rgba(77,255,180,0.4)' } : {}}
            onClick={() => onToggle(plan.id)} title={plan.achieved ? 'Mark as not yet achieved' : 'Mark as achieved'}>
            <Star size={12} fill={plan.achieved ? 'currentColor' : 'none'} />
          </button>
          <button className="btn btn-danger" style={{ padding: '5px' }} onClick={() => onDelete(plan.id)}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className={`plan-title${plan.achieved ? ' plan-achieved-text' : ''}`}>{plan.title}</div>
      {plan.description && <div className="plan-desc">{plan.description}</div>}

      <div className="plan-footer">
        <span className="tag" style={{ background: cat.color + '18', color: cat.color }}>{cat.label}</span>
        <span className={`tag priority-tag-${plan.priority}`}>{plan.priority}</span>
      </div>
    </div>
  )
}
