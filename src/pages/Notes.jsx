import { useState, useEffect, useRef } from 'react'
import { FileText, Plus, Trash2, Search, X, Tag, Clock } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Notes.css'

const COLORS = ['default', 'yellow', 'blue', 'green', 'red', 'purple']

export default function Notes() {
  const [notes, setNotes] = useLocalStorage('notes', [])
  const [activeId, setActiveId] = useState(null)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [newTag, setNewTag] = useState('')
  const textareaRef = useRef(null)

  const activeNote = notes.find(n => n.id === activeId)

  const createNote = () => {
    const note = {
      id: Date.now(),
      title: '',
      content: '',
      tags: [],
      color: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes(n => [note, ...n])
    setActiveId(note.id)
  }

  const updateNote = (id, updates) => {
    setNotes(n => n.map(note =>
      note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
    ))
  }

  const deleteNote = (id) => {
    setNotes(n => n.filter(note => note.id !== id))
    if (activeId === id) setActiveId(null)
  }

  const addTag = (noteId) => {
    const tag = newTag.trim().toLowerCase()
    if (!tag) return
    const note = notes.find(n => n.id === noteId)
    if (note && !note.tags.includes(tag)) {
      updateNote(noteId, { tags: [...note.tags, tag] })
    }
    setNewTag('')
  }

  const removeTag = (noteId, tag) => {
    const note = notes.find(n => n.id === noteId)
    if (note) updateNote(noteId, { tags: note.tags.filter(t => t !== tag) })
  }

  const allTags = [...new Set(notes.flatMap(n => n.tags))].sort()

  const filtered = notes.filter(n => {
    const q = search.toLowerCase()
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    const matchTag = !tagFilter || n.tags.includes(tagFilter)
    return matchSearch && matchTag
  })

  useEffect(() => {
    if (activeNote && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [activeId])

  return (
    <div className="notes-page fade-in">
      <div className="section-header">
        <h1 className="section-title">
          <FileText size={24} className="section-title-icon" color="#C8F135" />
          Notes
        </h1>
        <button className="btn btn-accent" onClick={createNote}>
          <Plus size={16} color="#07070f" /> New Note
        </button>
      </div>

      <div className="notes-layout">
        {/* Sidebar list */}
        <div className="notes-sidebar">
          <div className="notes-search">
            <Search size={14} color="#6B7280" />
            <input className="notes-search-input" placeholder="Search notes..." value={search}
              onChange={e => setSearch(e.target.value)} />
            {search && <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
              onClick={() => setSearch('')}><X size={12} color="#6B7280" /></button>}
          </div>

          {allTags.length > 0 && (
            <div className="notes-tags-filter">
              <button className={`tag-chip${!tagFilter ? ' active' : ''}`} onClick={() => setTagFilter('')}>All</button>
              {allTags.map(tag => (
                <button key={tag} className={`tag-chip${tagFilter === tag ? ' active' : ''}`} onClick={() => setTagFilter(t => t === tag ? '' : tag)}>
                  #{tag}
                </button>
              ))}
            </div>
          )}

          <div className="notes-list">
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <FileText size={36} color="#6B7280" />
                <p style={{ fontSize: '13px' }}>{notes.length === 0 ? 'No notes yet' : 'No matches'}</p>
              </div>
            ) : (
              filtered.map(note => (
                <div key={note.id}
                  className={`note-preview note-color-${note.color}${activeId === note.id ? ' active' : ''}`}
                  onClick={() => setActiveId(note.id)}>
                  <div className="note-preview-title">
                    {note.title || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Untitled</span>}
                  </div>
                  <div className="note-preview-content">
                    {note.content.slice(0, 80) || <span style={{ color: 'var(--text-dim)' }}>Empty note</span>}
                  </div>
                  <div className="note-preview-meta">
                    <Clock size={10} color="#6B7280" />
                    <span>{timeAgo(note.updatedAt)}</span>
                    {note.tags.length > 0 && <span className="note-preview-tags">· {note.tags.map(t => `#${t}`).join(' ')}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="notes-editor">
          {!activeNote ? (
            <div className="empty-state" style={{ height: '100%' }}>
              <FileText size={64} color="#6B7280" />
              <p>Select a note or create a new one</p>
              <button className="btn btn-accent" onClick={createNote}><Plus size={14} color="#07070f" /> New Note</button>
            </div>
          ) : (
            <div className="note-editor-inner">
              <div className="note-editor-header">
                <div className="note-color-picker">
                  {COLORS.map(c => (
                    <button key={c} className={`note-color-btn note-color-${c}${activeNote.color === c ? ' selected' : ''}`}
                      onClick={() => updateNote(activeNote.id, { color: c })} title={c} />
                  ))}
                </div>
                <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => deleteNote(activeNote.id)}>
                  <Trash2 size={14} color="#ff4d6d" /> Delete
                </button>
              </div>

              <input className="note-title-input" placeholder="Note title..."
                value={activeNote.title}
                onChange={e => updateNote(activeNote.id, { title: e.target.value })} />

              <textarea ref={textareaRef} className="note-content-input" placeholder="Start writing..."
                value={activeNote.content}
                onChange={e => updateNote(activeNote.id, { content: e.target.value })} />

              <div className="note-tags-area">
                <Tag size={12} color="#6B7280" />
                <div className="note-tags">
                  {activeNote.tags.map(tag => (
                    <span key={tag} className="note-tag">
                      #{tag}
                      <button onClick={() => removeTag(activeNote.id, tag)}>×</button>
                    </span>
                  ))}
                  <input className="tag-input" placeholder="Add tag..." value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(activeNote.id) } }} />
                </div>
              </div>

              <div className="note-footer">
                <span>Created {formatDateTime(activeNote.createdAt)}</span>
                <span>Updated {formatDateTime(activeNote.updatedAt)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
