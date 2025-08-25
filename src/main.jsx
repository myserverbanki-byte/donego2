import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { useStore, startDeadlineWatcher, ensureNotificationPermission } from './store.js'

const initTheme = () => {
  const theme = useStore.getState().theme
  const html = document.documentElement
  if (theme === 'dark') html.classList.add('dark'); else html.classList.remove('dark')
}
useStore.subscribe((state) => {
  const html = document.documentElement
  if (state.theme === 'dark') html.classList.add('dark'); else html.classList.remove('dark')
})
initTheme()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
}

ensureNotificationPermission().then(() => startDeadlineWatcher())

createRoot(document.getElementById('root')).render(<App />)
