import React from 'react'
export default function SearchBar({ query, setQuery, sort, setSort, filter, setFilter }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск..." className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
      <select value={sort} onChange={e=>setSort(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
        <option value="updated">по обновлению</option>
        <option value="created">по созданию</option>
        <option value="alpha">А-Я</option>
        <option value="deadline">по дедлайну</option>
      </select>
      <select value={filter} onChange={e=>setFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
        <option value="all">все</option>
        <option value="active">активные</option>
        <option value="done">выполненные</option>
        <option value="overdue">просроченные</option>
        <option value="premium">премиум</option>
      </select>
    </div>
  )
}
