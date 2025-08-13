import React, { useState } from "react";

export default function ChecklistForm({ onCreate }) {
  const [title, setTitle] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onCreate(t);
    setTitle("");
    window.dgTrack?.("checklist_create_submit");
  };

  return (
    <form onSubmit={submit} className="card">
      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
        Название чек-листа
      </label>
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Например: Переезд, Путешествие..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-grow min-w-0 rounded-md border border-gray-300 dark:border-slate-600 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-800 dark:text-slate-100"
        />
        <button type="submit" className="btn btn-primary flex-shrink-0">
          Создать
        </button>
      </div>
    </form>
  );
}
