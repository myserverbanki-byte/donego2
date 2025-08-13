// /src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import ChecklistForm from "./ChecklistForm";
import Checklist from "./Checklist";
import { defaultChecklists } from "./data/checklists";

const STORAGE_KEY = "donego.v1";
const ONBOARD_KEY = "donego.onboarded";
const THEME_KEY = "donego.theme";

function uid(prefix = "") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function deepCloneWithNewIds(libChecklist) {
  const newChecklistId = uid("c_");
  const newTasks = (libChecklist.tasks || []).map((t) => ({
    id: uid("t_"),
    text: t.text,
    done: false,
  }));
  return {
    id: newChecklistId,
    title: libChecklist.title,
    category: libChecklist.category || "Библиотека",
    tasks: newTasks,
  };
}

export default function App() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { myLists: [], library: defaultChecklists };
      }
      return JSON.parse(raw);
    } catch {
      return { myLists: [], library: defaultChecklists };
    }
  });

  const [view, setView] = useState("my"); // 'my' | 'library'
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [showOnboard, setShowOnboard] = useState(() => !localStorage.getItem(ONBOARD_KEY));
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));

  // persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  // theme persist + toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  useEffect(() => {
    setQuery("");
    setSelectedCategory("Все");
  }, [view]);

  const categories = useMemo(() => {
    const cats = new Set(defaultChecklists.map((c) => c.category || "Библиотека"));
    return ["Все", ...Array.from(cats)];
  }, []);

  // Handlers
  const createChecklist = (title) => {
    const t = title.trim();
    if (!t) return;
    const newC = { id: uid("c_"), title: t, category: "Мои", tasks: [] };
    setState((prev) => ({ ...prev, myLists: [newC, ...prev.myLists] }));
    window.dgTrack?.("checklist_create");
  };

  const removeChecklist = (id) => {
    if (!confirm("Удалить чек-лист?")) return;
    setState((prev) => ({ ...prev, myLists: prev.myLists.filter((c) => c.id !== id) }));
    window.dgTrack?.("checklist_delete");
  };

  const addTask = (checklistId, text) => {
    const t = text.trim();
    if (!t) return;
    setState((prev) => ({
      ...prev,
      myLists: prev.myLists.map((c) =>
        c.id === checklistId ? { ...c, tasks: [{ id: uid("t_"), text: t, done: false }, ...c.tasks] } : c
      ),
    }));
  };

  const toggleTask = (checklistId, taskId) => {
    setState((prev) => ({
      ...prev,
      myLists: prev.myLists.map((c) =>
        c.id === checklistId
          ? { ...c, tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
          : c
      ),
    }));
    // лёгкая тактильная отдача
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const removeTask = (checklistId, taskId) => {
    setState((prev) => ({
      ...prev,
      myLists: prev.myLists.map((c) =>
        c.id === checklistId ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) } : c
      ),
    }));
  };

  const renameTask = (checklistId, taskId, newText) => {
    setState((prev) => ({
      ...prev,
      myLists: prev.myLists.map((c) =>
        c.id === checklistId
          ? { ...c, tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, text: newText } : t)) }
          : c
      ),
    }));
  };

  const editTitle = (checklistId, newTitle) => {
    const t = newTitle.trim();
    if (!t) return;
    setState((prev) => ({
      ...prev,
      myLists: prev.myLists.map((c) => (c.id === checklistId ? { ...c, title: t } : c)),
    }));
  };

  const resetTasks = (checklistId) => {
    if (!confirm("Сбросить все отметки в этом чек-листе?")) return;
    setState((prev) => ({
      ...prev,
      myLists: prev.myLists.map((c) =>
        c.id === checklistId ? { ...c, tasks: c.tasks.map((t) => ({ ...t, done: false })) } : c
      ),
    }));
  };

  const clearCompleted = (checklistId) => {
    setState((prev) => ({
      ...prev,
      myLists: prev.myLists.map((c) =>
        c.id === checklistId ? { ...c, tasks: c.tasks.filter((t) => !t.done) } : c
      ),
    }));
  };

  const copyFromLibrary = (libId) => {
    const lib = state.library.find((l) => l.id === libId);
    if (!lib) return;
    const clone = deepCloneWithNewIds(lib);
    setState((prev) => ({ ...prev, myLists: [clone, ...prev.myLists] }));
    setView("my");
    window.dgTrack?.("library_copy", { lib_id: libId });
  };

  const filteredLibrary = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.library.filter((l) => {
      if (selectedCategory !== "Все" && (l.category || "Библиотека") !== selectedCategory) return false;
      if (!q) return true;
      return l.title.toLowerCase().includes(q) || (l.tasks || []).some((t) => t.text.toLowerCase().includes(q));
    });
  }, [state.library, query, selectedCategory]);

  const filteredMyLists = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.myLists.filter((l) => {
      if (selectedCategory !== "Все" && selectedCategory !== "Мои" && l.category !== selectedCategory) return false;
      if (selectedCategory === "Мои" && selectedCategory !== "Все" && l.category !== "Мои") return false;
      if (!q) return true;
      return l.title.toLowerCase().includes(q) || (l.tasks || []).some((t) => t.text.toLowerCase().includes(q));
    });
  }, [state.myLists, query, selectedCategory]);

  const totalTasks = state.myLists.reduce((s, c) => s + c.tasks.length, 0);
  const totalLists = state.myLists.length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-md mx-auto p-4 sm:p-6">
        <header className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-extrabold text-center w-full text-slate-900 dark:text-slate-100">DoneGo</h1>
          </div>

          <p className="text-center text-gray-600 dark:text-slate-300 mb-3 text-sm px-2">
            Чек-листы и мини-дайджесты — мобильный первый опыт.
          </p>

          <div className="flex justify-center gap-3 mb-3 text-sm text-gray-500 dark:text-slate-300">
            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              Списков: {totalLists}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              Задач: {totalTasks}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => {
                setView((v) => (v === "my" ? "library" : "my"));
                setQuery("");
                setSelectedCategory("Все");
              }}
              className="btn btn-primary"
            >
              {view === "my" ? "Библиотека" : "Мои списки"}
            </button>

            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="btn btn-secondary"
              title="Переключить тему"
            >
              {theme === 'dark' ? 'Светлая' : 'Тёмная'}
            </button>
          </div>

          {showOnboard && (
            <div className="card mb-4 text-sm text-slate-700 dark:text-slate-200">
              <p className="mb-2"><b>Подсказка:</b> создавайте чек-листы, добавляйте задачи, отмечайте и сбрасывайте выполненные.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Двойной клик по задаче — редактирование.</li>
                <li>Долгое нажатие (или кнопка) — удалить.</li>
                <li>Ищите по названию и задачам — совпадения подсвечиваются.</li>
              </ul>
              <div className="mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => { setShowOnboard(false); localStorage.setItem(ONBOARD_KEY, "1"); }}
                >
                  Понятно
                </button>
              </div>
            </div>
          )}
        </header>

        <main>
          <section className="mb-4">
            <ChecklistForm onCreate={createChecklist} />
          </section>

          <section className="mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="По названию или задаче..."
              className="w-full text-lg px-4 py-3 rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-800 dark:text-slate-100"
            />
          </section>

          <section className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Категории</span>
              <button
                className="text-sm underline text-blue-600 dark:text-blue-400"
                onClick={() => setSelectedCategory("Все")}
              >
                Сбросить
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          <section>
            {view === "my" ? (
              filteredMyLists.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-slate-300 text-base py-10">
                  У вас пока нет списков — создайте новый или импортируйте из библиотеки.
                </p>
              ) : (
                filteredMyLists.map((cl) => (
                  <div key={cl.id} className="mb-6 card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold dark:text-slate-100">Задачи по чек-листу</h3>
                        <p className="text-sm text-gray-400 dark:text-slate-400 mt-1">{cl.tasks.length} задач</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => removeChecklist(cl.id)}
                          className="btn btn-danger"
                        >
                          Удалить чек-лист
                        </button>
                      </div>
                    </div>

                    <Checklist
                      checklist={cl}
                      searchQuery={query}
                      onAddTask={(text) => addTask(cl.id, text)}
                      onToggleTask={(taskId) => toggleTask(cl.id, taskId)}
                      onRemoveTask={(taskId) => removeTask(cl.id, taskId)}
                      onRenameTask={(taskId, newText) => renameTask(cl.id, taskId, newText)}
                      onEditTitle={(newTitle) => editTitle(cl.id, newTitle)}
                      onReset={() => resetTasks(cl.id)}
                      onClearCompleted={() => clearCompleted(cl.id)}
                      onDelete={() => removeChecklist(cl.id)}
                    />
                  </div>
                ))
              )
            ) : filteredLibrary.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-slate-300 text-base py-10">Нет чек-листов в библиотеке.</p>
            ) : (
              filteredLibrary.map((lib) => (
                <div key={lib.id} className="mb-6 card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold dark:text-slate-100">{lib.title}</h3>
                    <button
                      onClick={() => copyFromLibrary(lib.id)}
                      className="btn btn-primary"
                      type="button"
                      aria-label={`Добавить чек-лист ${lib.title} в мои списки`}
                    >
                      Добавить
                    </button>
                  </div>

                  <ul className="space-y-2 text-gray-700 dark:text-slate-100 text-base">
                    {(lib.tasks || []).slice(0, 6).map((t, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <input type="checkbox" disabled className="w-5 h-5 cursor-default" />
                        <span>{t.text}</span>
                      </li>
                    ))}
                    {lib.tasks && lib.tasks.length > 6 && (
                      <li className="text-xs text-gray-400 dark:text-slate-400">...ещё {lib.tasks.length - 6} пунктов</li>
                    )}
                  </ul>
                </div>
              ))
            )}
          </section>
        </main>

        <footer className="mt-8 mb-6 text-center text-xs text-gray-400 dark:text-slate-400">
          DoneGo · оффлайн-прототип · localStorage
        </footer>
      </div>
    </div>
  );
}
