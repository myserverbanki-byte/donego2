import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Пропсы:
 * - checklist: { id, title, tasks: [{id,text,done}] }
 * - onAddTask(text)
 * - onToggleTask(taskId)
 * - onRemoveTask(taskId)
 * - onRenameTask(taskId, newText)
 * - onEditTitle(newTitle)
 * - onReset()
 * - onClearCompleted()
 * - onDelete()  (не используется внутри, удаление чек-листа — в App)
 * - searchQuery (для подсветки)
 */

function highlight(text, query) {
  const q = (query || "").trim();
  if (!q) return text;
  try {
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    const parts = String(text).split(re);
    return parts.map((p, i) =>
      re.test(p) ? <mark key={i} className="dg-mark">{p}</mark> : <React.Fragment key={i}>{p}</React.Fragment>
    );
  } catch {
    return text;
  }
}

export default function Checklist({
  checklist,
  onAddTask,
  onToggleTask,
  onRemoveTask,
  onRenameTask,
  onEditTitle,
  onReset,
  onClearCompleted,
  searchQuery = ""
}) {
  const [newTask, setNewTask] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(checklist.title || "");

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskValue, setTaskValue] = useState("");

  const tasks = Array.isArray(checklist.tasks) ? checklist.tasks : [];
  const hasCompleted = tasks.some(t => t.done);

  const submitTask = (e) => {
    e.preventDefault();
    const t = newTask.trim();
    if (!t) return;
    onAddTask(t);
    setNewTask("");
    window.dgTrack?.("task_add", { checklist_id: checklist.id });
  };

  const saveTitle = () => {
    const t = titleInput.trim();
    if (!t) return setEditingTitle(false);
    onEditTitle(t);
    setEditingTitle(false);
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskValue(task.text);
  };
  const saveTaskEdit = () => {
    const t = taskValue.trim();
    if (t && editingTaskId) {
      onRenameTask(editingTaskId, t);
      window.dgTrack?.("task_rename", { checklist_id: checklist.id });
    }
    setEditingTaskId(null);
    setTaskValue("");
  };

  return (
    <div>
      {/* Шапка чек-листа */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        {editingTitle ? (
          <>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setTitleInput(checklist.title);
                  setEditingTitle(false);
                }
              }}
              autoFocus
              className="flex-grow text-xl font-semibold border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-800"
            />
            <button
              onClick={saveTitle}
              className="btn btn-primary"
              type="button"
              aria-label="Сохранить название"
            >
              Сохранить
            </button>
          </>
        ) : (
          <>
            <h3
              className="text-xl font-semibold flex-grow cursor-pointer select-none hover:text-blue-600 dark:text-slate-100"
              onClick={() => setEditingTitle(true)}
              title="Кликните для редактирования названия"
            >
              {highlight(checklist.title || "Без названия", searchQuery)}
            </h3>
            <div className="flex gap-2">
              {hasCompleted && (
                <button
                  onClick={onClearCompleted}
                  className="btn btn-secondary"
                  type="button"
                  aria-label="Удалить выполненные"
                >
                  Удалить выполненные
                </button>
              )}
              <button
                onClick={onReset}
                className="btn btn-warning"
                type="button"
                aria-label="Сбросить отметки"
              >
                Сбросить
              </button>
            </div>
          </>
        )}
      </div>

      {/* Добавление задачи */}
      <form onSubmit={submitTask} className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Добавить задачу"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-grow min-w-0 rounded-md border border-gray-300 dark:border-slate-600 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-800 dark:text-slate-100"
        />
        <button type="submit" className="btn btn-primary flex-shrink-0">
          Добавить
        </button>
      </form>

      {/* Список задач */}
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-slate-800 rounded-md px-3 py-2 shadow-sm border border-gray-100 dark:border-slate-700"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
            >
              {editingTaskId === task.id ? (
                <input
                  type="text"
                  value={taskValue}
                  onChange={(e) => setTaskValue(e.target.value)}
                  onBlur={saveTaskEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTaskEdit();
                    if (e.key === "Escape") { setEditingTaskId(null); setTaskValue(""); }
                  }}
                  autoFocus
                  className="flex-grow border-b border-gray-400 dark:border-slate-500 focus:outline-none px-1 bg-transparent dark:text-slate-100"
                />
              ) : (
                <label
                  className="flex items-center gap-3 cursor-pointer select-none flex-grow"
                  onDoubleClick={() => startEditTask(task)}
                  title="Двойной клик — редактировать"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => onToggleTask(task.id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className={`text-base dark:text-slate-100 ${task.done ? "line-through text-gray-400 dark:text-slate-500" : ""}`}>
                    {highlight(task.text, searchQuery)}
                  </span>
                </label>
              )}

              <button
                onClick={() => {
                  if (window.confirm("Удалить задачу?")) {
                    onRemoveTask(task.id);
                    window.dgTrack?.("task_delete", { checklist_id: checklist.id });
                  }
                }}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold text-lg p-1 rounded-md active:scale-95 transition-transform"
                aria-label={`Удалить задачу: ${task.text}`}
                type="button"
              >
                &times;
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
