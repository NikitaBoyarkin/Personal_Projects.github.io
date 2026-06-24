/* theme.js — unified dark/light toggle for all portfolio pages */
(() => {
  const html = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const icon = toggle ? toggle.querySelector(".theme-icon") : null;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
    } catch (e) {
      // localStorage may be unavailable (private mode, blocked cookies)
    }
    return prefersDark ? "dark" : "light";
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  function persistTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // ignore storage errors
    }
  }

  // Initialize
  applyTheme(getInitialTheme());

  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      persistTheme(next);
    });
  }

  // Respect system changes only when no explicit user choice is stored
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      try {
        if (localStorage.getItem("theme")) return;
      } catch (e) {
        return;
      }
      applyTheme(e.matches ? "dark" : "light");
    });
})();
