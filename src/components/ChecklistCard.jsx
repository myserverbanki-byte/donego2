import React, { useMemo } from 'react'
import ProgressBar from './ProgressBar.jsx'

export default function ChecklistCard({ c, onOpen, onDelete }) {
  const items = c.items || []
  const total = items.length
  const done = items.filter(i => i.done).length
  const progress = total ? Math.round(done / total * 100) : 0
  const overdue = c.deadline && new Date(c.deadline).getTime() < Date.now() && done < total
  const deadlineLabel = useMemo(() => {
    if (!c.deadline) return 'Без дедлайна'
    try { return new Date(c.deadline).toLocaleString('ru-RU') } catch { return String(c.deadline) }
  }, [c.deadline])

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg">{c.title}</h3>
          <div className="text-xs text-gray-500">{c.category} · {c.access === 'premium' ? '⭐ Премиум' : 'Бесплатно'}</div>
        </div>
        <button onClick={onDelete} className="text-red-500 hover:underline">Удалить</button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <ProgressBar value={progress} />
        <div className="text-sm tabular-nums">{progress}%</div>
      </div>

      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Дедлайн: <span className={overdue ? 'text-red-500 font-medium' : ''}>{deadlineLabel}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => onOpen(c)} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white">Открыть</button>
      </div>
    </div>
  )
}
