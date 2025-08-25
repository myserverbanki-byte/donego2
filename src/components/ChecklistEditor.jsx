import React, { useState } from 'react'

export default function ChecklistEditor({ checklist, onClose, onSave }) {
  const [title, setTitle] = useState(checklist?.title || '')
  const [category, setCategory] = useState(checklist?.category || 'Без категории')
  const [access, setAccess] = useState(checklist?.access || 'free')
  const [deadline, setDeadline] = useState(checklist?.deadline || '')
  const [items, setItems] = useState(checklist?.items || [])

  const addItem = () => setItems([...items, { text: '', done: false }])
  const changeItem = (idx, value) => {
    const next = [...items]; next[idx] = { ...next[idx], text: value }; setItems(next)
  }
  const removeItem = (idx) => setItems(items.filter((_,i) => i !== idx))

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...(checklist?.id ? { id: checklist.id } : {}), title, category, access, deadline, items }
    onSave(payload)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="p-6 w-full max-w-lg border rounded-2xl shadow-xl bg-white dark:bg-gray-900">
        <h2 className="text-xl font-bold mb-4">{checklist?.id ? '✏️ Редактирование' : '🆕 Новый чек-лист'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Название" className="w-full border rounded-lg p-3 bg-white dark:bg-gray-900" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Категория</label>
              <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Напр. Работа" className="w-full border rounded-lg p-3 bg-white dark:bg-gray-900" />
            </div>
            <div>
              <label className="block text-sm mb-1">Доступ</label>
              <select value={access} onChange={e=>setAccess(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-gray-900">
                <option value="free">Бесплатно</option>
                <option value="premium">Премиум</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">⏳ Дедлайн</label>
            <input type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full border rounded-lg p-3 bg-white dark:bg-gray-900" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm">📋 Пункты</label>
              <button type="button" onClick={addItem} className="px-3 py-1.5 rounded-lg bg-green-500 text-white">+ Пункт</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={item.text}
                    onChange={e=>changeItem(idx, e.target.value)}
                    placeholder={`Пункт ${idx+1}`}
                    className="flex-1 border rounded-lg p-2 bg-white dark:bg-gray-900"
                  />
                  <button type="button" onClick={()=>removeItem(idx)} className="px-2 text-red-500">✕</button>
                </div>
              ))}
              {items.length===0 && <div className="text-sm text-gray-500">Добавьте первые пункты</div>}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-sky-600 text-white">💾 Сохранить</button>
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-800">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  )
}
