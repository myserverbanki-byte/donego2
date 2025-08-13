
import React from "react";

const ChecklistList = ({ checklists, onSelect, onDelete, filterCategory, setFilterCategory }) => {
  const filtered = filterCategory
    ? checklists.filter(cl => cl.category === filterCategory)
    : checklists;

  const categories = [...new Set(checklists.map(cl => cl.category))];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Чек-листы</h2>
      <select
        className="mb-4 p-2 border rounded w-full"
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
      >
        <option value="">Все категории</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <ul>
        {filtered.map((cl, index) => (
          <li
            key={index}
            className="flex justify-between items-center p-2 border-b hover:bg-gray-50"
          >
            <span className="cursor-pointer text-blue-700" onClick={() => onSelect(cl)}>
              {cl.title}
            </span>
            <button
              className="text-red-500 hover:underline"
              onClick={() => onDelete(cl.title)}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChecklistList;
