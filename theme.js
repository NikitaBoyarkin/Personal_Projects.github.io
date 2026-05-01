/* theme.js — Minimal theme toggle for blog pages */
(() => {
  const html = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  const icon = toggle.querySelector(".theme-icon");

  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");

  html.setAttribute("data-theme", theme);
  if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";

  toggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    if (icon) icon.textContent = next === "dark" ? "☀️" : "🌙";
  });
})();
