import { useState } from 'react'
import { DollarSign, Plus, Trash2, X, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Finance.css'

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Rent', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Education', 'Utilities', 'Other'],
}

function TransactionModal({ onClose, onSave }) {
  const [form, setForm] = useState({ type: 'expense', amount: '', description: '', category: 'Food', date: new Date().toISOString().split('T')[0] })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleTypeChange = (type) => {
    set('type', type)
    set('category', type === 'income' ? 'Salary' : 'Food')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.amount || !form.description.trim()) return
    onSave({ ...form, amount: parseFloat(form.amount) })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <span className="modal-title">Add Transaction</span>
          <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="type-toggle">
              <button type="button" className={`type-btn${form.type === 'expense' ? ' active expense' : ''}`}
                onClick={() => handleTypeChange('expense')}>
                <TrendingDown size={14} /> Expense
              </button>
              <button type="button" className={`type-btn${form.type === 'income' ? ' active income' : ''}`}
                onClick={() => handleTypeChange('income')}>
                <TrendingUp size={14} /> Income
              </button>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.amount}
                onChange={e => set('amount', e.target.value)} placeholder="0.00" autoFocus required />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <input className="input" value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="What was this for?" required />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES[form.type].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent"><Plus size={14} /> Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Finance() {
  const [transactions, setTransactions] = useLocalStorage('finance', [])
  const [showModal, setShowModal] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [filterMonth, setFilterMonth] = useState('')

  const addTransaction = (form) => {
    setTransactions(t => [...t, { ...form, id: Date.now() }])
  }

  const remove = (id) => setTransactions(t => t.filter(tx => tx.id !== id))

  const filtered = transactions.filter(t => {
    const typeOk = filterType === 'all' || t.type === filterType
    const monthOk = !filterMonth || t.date.startsWith(filterMonth)
    return typeOk && monthOk
  })

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpense

  const byCategory = filtered
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {})

  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const months = [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse()

  return (
    <div className="finance-page fade-in">
      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSave={addTransaction} />}

      <div className="section-header">
        <h1 className="section-title">
          <DollarSign size={24} className="section-title-icon" />
          Finance
        </h1>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Balance cards */}
      <div className="finance-summary">
        <div className="balance-card" style={{ borderColor: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          <Wallet size={20} style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }} />
          <div>
            <div className="balance-amount" style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {fmt(balance)}
            </div>
            <div className="balance-label">Net Balance</div>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={16} style={{ color: 'var(--success)' }} />
          <span className="stat-value" style={{ color: 'var(--success)' }}>{fmt(totalIncome)}</span>
          <span className="stat-label">Income</span>
        </div>
        <div className="stat-card">
          <TrendingDown size={16} style={{ color: 'var(--danger)' }} />
          <span className="stat-value" style={{ color: 'var(--danger)' }}>{fmt(totalExpense)}</span>
          <span className="stat-label">Expenses</span>
        </div>
      </div>

      {/* Category breakdown */}
      {topCategories.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 600, marginBottom: '14px', fontSize: '14px', color: 'var(--text-muted)' }}>
            TOP EXPENSE CATEGORIES
          </div>
          {topCategories.map(([cat, amt]) => (
            <div key={cat} className="cat-bar-row">
              <span className="cat-bar-label">{cat}</span>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${(amt / totalExpense) * 100}%`, background: 'linear-gradient(90deg, var(--danger), #ff8fa3)' }} />
              </div>
              <span className="cat-bar-amount">{fmt(amt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="tasks-filters" style={{ marginBottom: '16px' }}>
        <div className="filter-group">
          {['all', 'income', 'expense'].map(f => (
            <button key={f} className={`filter-btn${filterType === f ? ' active' : ''}`} onClick={() => setFilterType(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {months.length > 0 && (
          <select className="input" style={{ padding: '6px 28px 6px 10px', fontSize: '13px', width: 'auto' }}
            value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">All time</option>
            {months.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
          </select>
        )}
      </div>

      {/* Transaction list */}
      <div className="transaction-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} />
            <p>{transactions.length === 0 ? 'No transactions yet. Add your first one!' : 'No transactions match your filter.'}</p>
          </div>
        ) : (
          [...filtered]
            .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
            .map(tx => (
              <div key={tx.id} className="tx-item card">
                <div className={`tx-icon ${tx.type}`}>
                  {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div className="tx-content">
                  <div className="tx-desc">{tx.description}</div>
                  <div className="tx-meta">
                    <span className="task-cat">{tx.category}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{formatDate(tx.date)}</span>
                  </div>
                </div>
                <div className={`tx-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </div>
                <button className="btn btn-danger task-delete" onClick={() => remove(tx.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatMonth(m) {
  const [year, month] = m.split('-')
  return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
