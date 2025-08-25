import React from 'react'
export default function ProgressBar({ value=0 }) {
  return (
    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
      <div className="h-full bg-sky-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}
