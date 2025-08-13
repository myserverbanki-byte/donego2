// src/Home.jsx
import React from "react";
import { checklists } from "./data";

function Home({ onSelect }) {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Выберите чек-лист</h1>
      <ul className="space-y-3">
        {checklists.map((cl) => (
          <li
            key={cl.id}
            className="p-4 bg-white rounded-xl shadow cursor-pointer hover:bg-gray-100"
            onClick={() => onSelect(cl)}
          >
            {cl.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
