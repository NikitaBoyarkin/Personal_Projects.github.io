/* ===============================
   PROJECT LIST
   =============================== */
const projects = [
  { id: "rfm",    md: "projects/rfm.md" },
  { id: "bot",    md: "projects/bot.md" },
  { id: "cohort", md: "projects/cohort.md" },
  { id: "abtest", md: "projects/abtest.md" }
];

/* ===============================
   1) RENDER PROJECT CARDS
   =============================== */
async function renderProjectCards() {
  const container = document.querySelector("#project-list");
  if (!container) return;

  let cards = "";

  for (const p of projects) {
    const md = await fetch(p.md).then(r => r.text());
    const html = marked.parse(md);

    const temp = document.createElement("div");
    temp.innerHTML = html;

    const title = temp.querySelector("h1")?.textContent ?? "Project";
    const img = temp.querySelector("img")?.src ?? "";
    const desc = temp.querySelector("p")?.textContent ?? "Project description";

    cards += `
      <div class="project">
        ${img ? `<img src="${img}">` : ""}
        <h3>${title}</h3>
        <p>${desc}</p>
        <a class="button" href="./projects/${p.id}/index.html">View Project</a>
      </div>
    `;
  }

  container.innerHTML = cards;
}

/* ===============================
   2) GENERATE PROJECT PAGE
   =============================== */
async function generateProjectPage() {
  const match = window.location.pathname.match(/projects\/([^\/]+)\/index\.html/);
  if (!match) return;

  const id = match[1];
  const project = projects.find(p => p.id === id);
  if (!project) return;

  const md = await fetch("../../" + project.md).then(r => r.text());
  const html = marked.parse(md);

  const container = document.querySelector("#project-content");
  container.innerHTML = html;

  const title = container.querySelector("h1");
  if (title) {
    document.querySelector("#project-title").textContent = title.textContent;
    document.title = title.textContent + " | Portfolio";
    title.remove();
  }

  const img = container.querySelector("img");
  if (img) {
    document.querySelector("#project-image").src = img.src;
    img.remove();
  }
}

/* ===============================
   THEME TOGGLE
   =============================== */
function initThemeToggle() {
  const toggleButton = document.getElementById('toggleButton');
  const body = document.body;
  
  // Check for saved theme preference or default to dark
  const currentTheme = localStorage.getItem('theme') || 'dark';
  body.setAttribute('data-theme', currentTheme);
  toggleButton.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  
  toggleButton.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    toggleButton.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });
}

/* ===============================
   INIT
   =============================== */
document.addEventListener("DOMContentLoaded", () => {
  renderProjectCards();
  generateProjectPage();
  initThemeToggle();
});