import React from 'react'
import { useStore } from '../store.js'
export default function Header() {
  const { theme, setTheme } = useStore()
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="font-semibold">✅ DoneGo</div>
        <nav className="flex items-center gap-3">
          <a className="text-sm text-sky-600 hover:underline" href="https://donego.ru" target="_blank" rel="noreferrer">donego.ru</a>
          <button onClick={toggle} className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button>
        </nav>
      </div>
    </header>
  )
}
