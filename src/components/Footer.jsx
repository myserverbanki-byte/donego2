import React from 'react'
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <span>© {new Date().getFullYear()} DoneGo</span>
        <a className="hover:underline" href="https://donego.ru" target="_blank" rel="noreferrer">Статьи и советы →</a>
      </div>
    </footer>
  )
}
