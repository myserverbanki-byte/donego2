import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Инициализация темы при старте
const THEME_KEY = "donego.theme";
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldDark = saved ? saved === 'dark' : prefersDark;
  document.documentElement.classList.toggle('dark', shouldDark);
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
