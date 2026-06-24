/* generator.js — render project cards and project detail pages from Markdown */

/* ===============================
   PROJECT LIST
   =============================== */
const projects = [
  { id: "rfm", md: "projects/rfm.md" },
  { id: "bot", md: "projects/bot.md" },
  { id: "cohort", md: "projects/cohort.md" },
  { id: "abtest", md: "projects/abtest.md" },
  { id: "test", md: "projects/test.md" },
];

/* ===============================
   Utilities
   =============================== */
function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9Ѐ-ӿ\-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.toString().replace(/[&<>"']/g, (c) => map[c]);
}

function createSkeletonCard() {
  return `
    <div class="project skeleton-card" aria-busy="true" aria-label="Loading project">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
      <div class="skeleton skeleton-btn"></div>
    </div>
  `;
}

/* ===============================
   1) GENERATE CARDS FROM MD
   =============================== */
async function renderProjectCards() {
  const container = document.querySelector("#project-list");
  if (!container) return;

  container.innerHTML = projects.map(() => createSkeletonCard()).join("");

  const cards = [];

  for (const p of projects) {
    try {
      const res = await fetch(p.md);
      if (!res.ok) throw new Error(`Failed to load ${p.md}: ${res.status}`);
      const md = await res.text();
      const html = marked.parse(md);

      const temp = document.createElement("div");
      temp.innerHTML = html;

      const title = escapeHtml(temp.querySelector("h1")?.textContent || "Project");
      const img = temp.querySelector("img")?.getAttribute("src") || "";
      const desc = escapeHtml(temp.querySelector("p")?.textContent || "");

      const toolsHeader = Array.from(temp.querySelectorAll("h2")).find(
        (h) => h.textContent.trim() === "Impact",
      );
      let tools = "";
      if (toolsHeader) {
        const ul = toolsHeader.nextElementSibling;
        if (ul && ul.tagName === "UL") {
          tools = escapeHtml(
            Array.from(ul.querySelectorAll("li"))
              .map((li) => li.textContent.trim())
              .join(", "),
          );
        }
      }

      // Markdown images are usually "images/..." or "../images/...".
      // On the landing page both resolve to the same root-relative images/ folder.
      const imgSrc = img ? escapeHtml(img.replace(/^\.\.\//, "")) : "";

      cards.push(`
        <article class="project reveal">
          ${imgSrc ? `<img src="${imgSrc}" alt="${title}" loading="lazy">` : ""}
          <h3>${title}</h3>
          <p>${desc}</p>
          ${tools ? `<p class="Impact">Impact: ${tools}</p>` : ""}
          <a class="button" href="./projects/${p.id}/index.html">View Project</a>
        </article>
      `);
    } catch (e) {
      console.warn("Failed to load", p.md, e);
    }
  }

  container.innerHTML = cards.join("");
}

/* ===============================
   2) GENERATE A PROJECT PAGE FROM MD
   =============================== */
async function generateProjectPage() {
  // Match /projects/<id>/index.html, /projects/<id>/, or /projects/<id>
  const match = window.location.pathname.match(/projects\/([^\/]+)(?:\/index\.html|\/)?$/);
  if (!match) return;

  const id = match[1];
  const project = projects.find((p) => p.id === id);
  if (!project) {
    console.warn("Unknown project id:", id);
    return;
  }

  try {
    // Resolve the markdown path from the current page location. Using "../../"
    // keeps the URL correct whether the page is /projects/<id>/index.html,
    // /projects/<id>/, or /projects/<id>.
    const mdUrl = new URL("../../" + project.md, window.location.href).href;
    const res = await fetch(mdUrl);
    if (!res.ok) throw new Error(`MD not found: ${res.status}`);
    const md = await res.text();
    const html = marked.parse(md);

    const content = document.querySelector("#project-content");
    if (!content) return;

    // Parse markdown HTML off-DOM so we can rewrite paths before the browser
    // starts fetching images with wrong relative URLs.
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Normalize all image paths (images/... -> ../../images/...)
    temp.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src");
      if (src && src.startsWith("images/")) {
        img.src = src.replace(/^images\//, "../../images/");
      }
    });

    // Promote h1 to page title and remove it from content
    let projectTitle = "";
    const h1 = temp.querySelector("h1");
    if (h1) {
      projectTitle = h1.textContent;
      const projectTitleEl = document.querySelector("#project-title");
      if (projectTitleEl) projectTitleEl.textContent = projectTitle;
      document.title = projectTitle + " | Portfolio";
      h1.remove();
    }

    // Use the first image as the hero image
    const img = temp.querySelector("img");
    if (img) {
      const hero = document.querySelector("#project-image");
      if (hero) {
        hero.src = img.getAttribute("src");
        hero.alt = projectTitle ? `${projectTitle} preview` : document.title;
      }
      img.remove();
    }

    content.innerHTML = temp.innerHTML;

    generateInnerTOC();
    enableSmoothScrollForTOC();
  } catch (e) {
    console.error("generateProjectPage error:", e);
    const content = document.querySelector("#project-content");
    if (content) {
      content.innerHTML = `<p class="error">Unable to load project content. Please try again later.</p>`;
    }
  }
}

/* ===============================
   3) INNER TOC
   =============================== */
function generateInnerTOC() {
  const tocList = document.querySelector("#inner-toc-list");
  const container = document.querySelector("#project-content");
  if (!tocList || !container) return;

  tocList.innerHTML = "";

  const headers = Array.from(container.querySelectorAll("h2, h3"));
  if (!headers.length) {
    const tocWrap = document.getElementById("inner-toc");
    if (tocWrap) tocWrap.style.display = "none";
    return;
  }

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

    const li = document.createElement("li");
    li.className = h.tagName.toLowerCase() === "h3" ? "toc-h3" : "toc-h2";
    li.innerHTML = `<a href="#${id}" data-id="${id}">${text}</a>`;
    tocList.appendChild(li);
  });

  function updateActive() {
    const pos = window.scrollY + 160;
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
    const offset = 110;
    const top = window.scrollY + target.getBoundingClientRect().top - offset;
    window.scrollTo({ top, behavior: "smooth" });

    document
      .querySelectorAll("#inner-toc a")
      .forEach((el) => el.classList.remove("active"));
    a.classList.add("active");
  });
}

/* ===============================
   Intersection Observer for reveal animations
   =============================== */
function initRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ===============================
   Navbar scroll detection
   =============================== */
function initNavbarScroll() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    nav.classList.toggle("scrolled", currentScroll > 20);
  });
}

/* ===============================
   INIT
   =============================== */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof marked === "undefined") {
    console.error(
      "marked.js not found. Make sure you included it BEFORE generator.js",
    );
    return;
  }

  renderProjectCards().then(() => {
    initRevealObserver();
  });
  generateProjectPage();
  initNavbarScroll();
});
