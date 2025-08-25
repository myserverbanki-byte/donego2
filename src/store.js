import { create } from 'zustand'

const load = () => {
  try { return JSON.parse(localStorage.getItem('donego.store')) || {} } catch { return {} }
}
const save = (data) => {
  try { localStorage.setItem('donego.store', JSON.stringify(data)) } catch {}
}

const initial = load()
const defaultState = {
  theme: initial.theme || 'light',
  checklists: initial.checklists || [],
  categories: initial.categories || ['Дом','Работа','Здоровье','Путешествия'],
}

export const useStore = create((set, get) => ({
  ...defaultState,
  setTheme: (t) => { set({ theme: t }); save({ ...get(), theme: t }) },

  createChecklist: (payload) => {
    const now = Date.now()
    const c = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(now),
      title: payload.title || 'Новый список',
      category: payload.category || 'Без категории',
      access: payload.access || 'free',
      deadline: payload.deadline || '',
      items: payload.items || [],
      createdAt: now, updatedAt: now,
    }
    const data = { ...get(), checklists: [c, ...get().checklists] }
    set({ checklists: data.checklists })
    save(data)
    return c
  },

  updateChecklist: (c) => {
    const data = { ...get() }
    data.checklists = data.checklists.map(x => x.id === c.id ? { ...x, ...c, updatedAt: Date.now() } : x)
    set({ checklists: data.checklists })
    save(data)
  },

  deleteChecklist: (id) => {
    const data = { ...get(), checklists: get().checklists.filter(c => c.id !== id) }
    set({ checklists: data.checklists })
    save(data)
  },

  toggleItem: (cid, idx) => {
    const data = { ...get() }
    data.checklists = data.checklists.map(c => {
      if (c.id !== cid) return c
      const items = [...(c.items || [])]
      items[idx] = { ...items[idx], done: !items[idx].done }
      return { ...c, items, updatedAt: Date.now() }
    })
    set({ checklists: data.checklists })
    save(data)
  },
}))

export async function ensureNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission !== 'denied') {
    const res = await Notification.requestPermission()
    return res === 'granted'
  }
  return false
}

export function startDeadlineWatcher() {
  setInterval(() => {
    const { checklists } = useStore.getState()
    const now = Date.now()
    checklists.forEach(c => {
      if (!c.deadline) return
      const ts = new Date(c.deadline).getTime()
      const total = (c.items || []).length
      const done = (c.items || []).filter(i => i.done).length
      if (ts <= now && total > 0 && done < total) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⏰ Дедлайн по чек-листу', { body: `«${c.title}» — проверь задачи`, tag: `deadline-${c.id}` })
        }
      }
    })
  }, 60000)
}
