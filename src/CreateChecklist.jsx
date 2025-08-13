
import React, { useState } from "react";

const CreateChecklist = ({ onCreate }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState([""]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || items.length === 0 || !onCreate) return;
    onCreate({ title, category, items: items.map(item => ({ text: item, done: false })) });
    setTitle("");
    setCategory("");
    setItems([""]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Создать чек-лист</h2>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-2"
        placeholder="Категория"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      {items.map((item, index) => (
        <input
          key={index}
          className="border p-2 w-full mb-2"
          placeholder={`Пункт ${index + 1}`}
          value={item}
          onChange={(e) => {
            const newItems = [...items];
            newItems[index] = e.target.value;
            setItems(newItems);
          }}
        />
      ))}
      <button
        type="button"
        className="text-blue-500 mb-2"
        onClick={() => setItems([...items, ""])}
      >
        + Добавить пункт
      </button>
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        Создать
      </button>
    </form>
  );
};

export default CreateChecklist;
