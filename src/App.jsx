import React, { useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import SearchBar from './components/SearchBar.jsx'
import ChecklistCard from './components/ChecklistCard.jsx'
import ChecklistView from './components/ChecklistView.jsx'
import ChecklistEditor from './components/ChecklistEditor.jsx'
import { useStore } from './store.js'

export default function App() {
  const { checklists, createChecklist, deleteChecklist, updateChecklist } = useStore()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('updated')
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => {
    let data = [...checklists]
    if (query) data = data.filter(c => (c.title || '').toLowerCase().includes(query.toLowerCase()))
    if (filter !== 'all') {
      data = data.filter(c => {
        const items = c.items || []
        const done = items.filter(i=>i.done).length
        const total = items.length
        const overdue = c.deadline && new Date(c.deadline).getTime() < Date.now() && done < total
        if (filter === 'active') return total === 0 || done < total
        if (filter === 'done') return total > 0 && done === total
        if (filter === 'overdue') return overdue
        if (filter === 'premium') return c.access === 'premium'
        return true
      })
    }
    const by = {
      'updated': (a,b)=> (b.updatedAt||0) - (a.updatedAt||0),
      'created': (a,b)=> (b.createdAt||0) - (a.createdAt||0),
      'alpha'  : (a,b)=> (a.title||'').localeCompare(b.title||'', 'ru'),
      'deadline':(a,b)=> (a.deadline?new Date(a.deadline):Infinity) - (b.deadline?new Date(b.deadline):Infinity)
    }[sort]
    return data.sort(by)
  }, [checklists, query, sort, filter])

  const handleCreate = () => setEditing({ title: 'Новый список', category: 'Без категории', access:'free', deadline:'', items: [] })
  const handleSave = (payload) => { if (payload.id) updateChecklist(payload); else createChecklist(payload); setEditing(null) }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <SearchBar query={query} setQuery={setQuery} sort={sort} setSort={setSort} filter={filter} setFilter={setFilter} />
            <button onClick={handleCreate} className="px-4 py-2 rounded-xl bg-sky-600 text-white shadow hover:bg-sky-700">Новый чек-лист</button>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <ChecklistCard key={c.id} c={c} onOpen={setOpen} onDelete={() => deleteChecklist(c.id)} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      {open && !editing && (
        <ChecklistView checklist={open} onClose={() => setOpen(null)} onEdit={() => { setEditing(open); setOpen(null) }} />
      )}
      {editing && (
        <ChecklistEditor checklist={editing} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
    </div>
  )
}
