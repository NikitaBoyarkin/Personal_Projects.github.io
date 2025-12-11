// mdPath: путь к .md относительно корня, например "projects/rfm.md"
// imgSrc: значение src из <img> в сгенерированном HTML, например "../images/foo.png" или "images/foo.png"
function resolveImagePath(mdPath, imgSrc) {
  try {
    // base = абсолютный URL к md файлу, e.g. https://site.origin/projects/rfm.md
    const origin =
      window.location.origin ||
      window.location.protocol + "//" + window.location.host;
    const base = origin + "/" + mdPath.replace(/^\.\//, "");
    // new URL резолвит ../ и т.п. и возвращает абсолютный URL
    const abs = new URL(imgSrc, base).pathname; // возвращает, например, "/images/foo.png"
    // используем путь от корня (без origin) — будет работать и на GitHub Pages
    return abs.startsWith("/") ? abs : "/" + abs;
  } catch (e) {
    // fallback: если что-то сломалось — вернём оригинал
    return imgSrc;
  }
}

/* ===============================
   PROJECT LIST (пример)
   =============================== */
const projects = [
  { id: "rfm", md: "projects/rfm.md" },
  { id: "bot", md: "projects/bot.md" },
  { id: "cohort", md: "projects/cohort.md" },
  { id: "abtest", md: "projects/abtest.md" },
];

/* ===============================
   Утилиты
   =============================== */
// Преобразует заголовок в безопасный slug (удаляет спецсимволы, транслит/кирилица оставляем, но чистим)
function slugify(text) {
  return (
    text
      .toString()
      .trim()
      .toLowerCase()
      // заменяем кириллические пробелы и спецсимволы на дефис
      .replace(/[\s]+/g, "-")
      // удалить всё кроме букв, цифр, дефиса и подчеркивания
      .replace(/[^a-z0-9\u0400-\u04FF\-\_]/g, "")
      // убрать повторяющиеся дефисы
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

/* ===============================
   1) GENERATE CARDS FROM MD
   =============================== */
async function renderProjectCards() {
  const container = document.querySelector("#project-list");
  if (!container) return;

  let output = "";

  for (const p of projects) {
    try {
      const res = await fetch(p.md);
      if (!res.ok) throw new Error("Not found");
      const md = await res.text();
      const html = marked.parse(md);

      const temp = document.createElement("div");
      temp.innerHTML = html;

      const title = temp.querySelector("h1")?.textContent || "Project";
      const img = temp.querySelector("img")?.getAttribute("src") || "";
      const desc = temp.querySelector("p")?.textContent || "";

      // нормализуем путь к картинке (если в md указан ../images/...)
      const imgSrc = img ? img.replace(/^\.\.\//, "") : "";

      output += `
        <div class="project">
          ${imgSrc ? `<img src="${imgSrc}" alt="${title}">` : ""}
          <h3>${title}</h3>
          <p>${desc}</p>
          <a class="button" href="./projects/${
            p.id
          }/index.html">View Project</a>
        </div>
      `;
    } catch (e) {
      console.warn("Failed to load", p.md, e);
    }
  }

  container.innerHTML = output;
}

/* ===============================
   2) GENERATE A PROJECT PAGE FROM MD
   =============================== */
async function generateProjectPage() {
  // путь: /projects/<id>/index.html
  const match = window.location.pathname.match(
    /projects\/([^\/]+)\/index\.html/
  );
  if (!match) return;

  const id = match[1];
  const project = projects.find((p) => p.id === id);
  if (!project) return;

  try {
    const res = await fetch("../../" + project.md);
    if (!res.ok) throw new Error("MD not found");
    const md = await res.text();
    const html = marked.parse(md);

    const content = document.querySelector("#project-content");
    if (!content) return;

    // вставляем HTML из Markdown
    content.innerHTML = html;

    // обрабатываем <h1> — ставим заголовок страницы и удаляем из контента
    const h1 = content.querySelector("h1");
    if (h1) {
      const projectTitleEl = document.querySelector("#project-title");
      if (projectTitleEl) projectTitleEl.textContent = h1.textContent;
      document.title = h1.textContent + " | Portfolio";
      h1.remove();
    }

    // берем первую картинку как hero
    const img = content.querySelector("img");
    if (img) {
      const hero = document.querySelector("#project-image");
      if (hero) {
        // нормализуем путь (images/... -> ../../images/...)
        hero.src = img
          .getAttribute("src")
          .replace(/^images\//, "../../images/");
      }
      img.remove();
    }

    // после вставки контента — генерируем внутреннее оглавление
    generateInnerTOC();
    enableSmoothScrollForTOC();
  } catch (e) {
    console.error("generateProjectPage error:", e);
  }
}

/* ===============================
   3) INNER TOC (H2 + H3) - улучшенная
   =============================== */
function generateInnerTOC() {
  const tocList = document.querySelector("#inner-toc-list");
  const container = document.querySelector("#project-content");
  if (!tocList || !container) return;

  tocList.innerHTML = "";

  // Получаем заголовки H2 и H3
  const headers = Array.from(container.querySelectorAll("h2, h3"));
  if (!headers.length) {
    // если заголовков нет — скрываем TOC
    const tocWrap = document.getElementById("inner-toc");
    if (tocWrap) tocWrap.style.display = "none";
    return;
  }

  // Для уникальности id — учитываем уже встреченные
  const used = new Map();

  headers.forEach((h) => {
    const text = h.textContent || "";
    let idBase = slugify(text) || "section";
    let id = idBase;
    let count = 1;
    while (used.has(id)) {
      id = `${idBase}-${count++}`;
    }
    used.set(id, true);
    h.id = id;

    // создаём пункт TOC, вложение для h3
    const li = document.createElement("li");
    // add class by tagName to allow slight indenting for h3 via CSS if needed
    li.className = h.tagName.toLowerCase() === "h3" ? "toc-h3" : "toc-h2";
    li.innerHTML = `<a href="#${id}" data-id="${id}">${text}</a>`;
    tocList.appendChild(li);
  });

  // подсветка на скролле
  function updateActive() {
    let pos = window.scrollY + 160;
    let current = "";

    for (let i = 0; i < headers.length; i++) {
      const h = headers[i];
      if (h.offsetTop <= pos) current = h.id;
    }

    document.querySelectorAll("#inner-toc a").forEach((a) => {
      a.classList.toggle("active", a.dataset.id === current);
    });
  }

  updateActive();
  window.removeEventListener("scroll", updateActive);
  window.addEventListener("scroll", updateActive);
}

/* ===============================
   Smooth scroll: перехватываем клики на TOC и делаем плавный скролл
   =============================== */
function enableSmoothScrollForTOC() {
  const toc = document.getElementById("inner-toc");
  if (!toc) return;

  toc.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const id = a.getAttribute("href")?.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    // плавный скролл с учётом фиксированного header (пример 120px)
    const offset = 110;
    const top = window.scrollY + target.getBoundingClientRect().top - offset;
    window.scrollTo({ top, behavior: "smooth" });
    // обновим подсветку
    document
      .querySelectorAll("#inner-toc a")
      .forEach((el) => el.classList.remove("active"));
    a.classList.add("active");
  });
}

/* ===============================
   INIT
   =============================== */
document.addEventListener("DOMContentLoaded", () => {
  // Убедись, что marked уже загружен (если нет — попробуем дождаться)
  if (typeof marked === "undefined") {
    console.error(
      "marked.js not found. Make sure you included it BEFORE generator.js"
    );
  }
  renderProjectCards();
  generateProjectPage();
});
