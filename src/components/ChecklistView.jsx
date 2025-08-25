import React from 'react'
import { useStore } from '../store.js'
import ProgressBar from './ProgressBar.jsx'

export default function ChecklistView({ checklist, onClose, onEdit }) {
  if (!checklist) return null
  const items = checklist.items || []
  const total = items.length
  const done = items.filter(i=>i.done).length
  const progress = total ? Math.round(done/total*100) : 0
  const { toggleItem } = useStore()

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold mb-2">{checklist.title}</h2>
        {checklist.deadline && (
          <p className="text-sm text-gray-500 mb-2">
            Дедлайн: {new Date(checklist.deadline).toLocaleString('ru-RU')}
          </p>
        )}

        <div className="mb-3">
          <ProgressBar value={progress} />
          <div className="text-xs mt-1 text-gray-500">{done} / {total}</div>
        </div>

        <ul className="space-y-2 max-h-80 overflow-auto pr-1">
          {items.length > 0 ? items.map((i, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <input type="checkbox" checked={!!i.done} onChange={() => toggleItem(checklist.id, idx)} />
              <span className={i.done ? 'line-through text-gray-500' : ''}>{i.text}</span>
            </li>
          )) : <p className="text-gray-400">Задач пока нет</p>}
        </ul>

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800" onClick={onClose}>Закрыть</button>
          <button className="px-4 py-2 rounded-lg bg-sky-600 text-white" onClick={onEdit}>Редактировать</button>
        </div>
      </div>
    </div>
  )
}
