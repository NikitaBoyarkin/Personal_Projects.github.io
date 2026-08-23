// Build-time llms.txt — generated from the content collections so it can never
// drift from the site. Replaces the old hand-maintained public/llms.txt.
//
// Format follows https://llmstxt.org/. Emitted at /llms.txt.
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { withBase } from "../lib/path";

const SITE = "https://nikitaboyarkin.github.io";
const slugOf = (id: string) => id.replace(/\.md$/, "");

export async function GET(context: APIContext) {
  const site = (context.site?.toString() ?? SITE).replace(/\/$/, "");
  const abs = (path: string) => `${site}${withBase(path)}`;

  const [projects, projectsEn, posts, postsEn, voltaParts] = await Promise.all([
    getCollection("projects", (p) => !p.data.draft),
    getCollection("projects-en", (p) => !p.data.draft),
    getCollection("posts", (p) => !p.data.draft),
    getCollection("posts-en", (p) => !p.data.draft),
    getCollection("volta-parts", (p) => !p.data.draft),
  ]);

  const projectsSorted = [...projects].sort((a, b) =>
    a.data.title.localeCompare(b.data.title, "ru"),
  );
  const projectsEnSorted = [...projectsEn].sort((a, b) =>
    a.data.title.localeCompare(b.data.title, "en"),
  );
  const postsSorted = [...posts].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  const postsEnSorted = [...postsEn].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  const partsSorted = [...voltaParts].sort((a, b) => a.data.order - b.data.order);

  const lines: string[] = [];
  const add = (s = "") => lines.push(s);

  add("# Nikita Boyarkin — Data Analyst / Product Analyst");
  add();
  add(
    "> Portfolio of Nikita Boyarkin: SQL, Python, A/B testing, retention, segmentation. " +
      "Case studies with reproducible methodology (CUPED, AA-tests, ship-gates) and a " +
      "skill taxonomy. Russian (default) + English.",
  );
  add();

  add("## Core pages");
  add(`- [Home (RU)](${abs("")}): intro, featured project (Volta neobank analytics), skill taxonomy.`);
  add(`- [Home (EN)](${abs("en/")}): English mirror.`);
  add(`- [About](${abs("about/")}): background and focus.`);
  add(`- [Writing](${abs("writing/")}): articles on SQL, A/B testing, retention, segmentation, automation.`);
  add(`- [Skill taxonomy](${abs("topics/")}): Junior/Middle/Senior topics with case studies per topic.`);
  add(`- [Start here](${abs("start/")}): how to read the portfolio.`);
  add(`- [Knowledge graph](${abs("graph/")}): product-analytics domain map.`);
  add(`- [Games](${abs("games/")}): playable A/B-test and funnel-drop mini-games.`);
  add();

  add("## Featured project");
  const volta = projectsSorted.find((p) => slugOf(p.id) === "volta");
  if (volta) {
    add(`- [${volta.data.title}](${abs(`projects/${slugOf(volta.id)}/`)}): ${volta.data.description}`);
    add();
    add("### Volta modules");
    for (const part of partsSorted) {
      add(`- [${part.data.title}](${abs(`projects/volta/${slugOf(part.id)}/`)}): ${part.data.description}`);
    }
    add();
  }

  add("## Projects");
  for (const p of projectsSorted) {
    add(`- [${p.data.title}](${abs(`projects/${slugOf(p.id)}/`)}): ${p.data.description}`);
  }
  add();

  add("## Writing");
  for (const post of postsSorted) {
    add(`- [${post.data.title}](${abs(`posts/${slugOf(post.id)}/`)}): ${post.data.excerpt}`);
  }
  add();

  if (projectsEnSorted.length || postsEnSorted.length) {
    add("## English");
    if (projectsEnSorted.length) {
      add();
      add("### Projects (EN)");
      for (const p of projectsEnSorted) {
        add(`- [${p.data.title}](${abs(`en/projects/${slugOf(p.id)}/`)}): ${p.data.description}`);
      }
    }
    if (postsEnSorted.length) {
      add();
      add("### Writing (EN)");
      for (const post of postsEnSorted) {
        add(`- [${post.data.title}](${abs(`en/posts/${slugOf(post.id)}/`)}): ${post.data.excerpt}`);
      }
    }
    add();
  }

  add("## Contact");
  add(`- [CV](${abs("cv/")}): full CV.`);
  add(`- [CV (PDF)](${abs("CV-Nikita-Boyarkin.pdf")}): printable one-page CV.`);
  add("- GitHub: https://github.com/NikitaBoyarkin");
  add("- LinkedIn: https://www.linkedin.com/in/nikita-boyarkin");
  add("- Telegram: https://t.me/lofinibo");
  add();

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}