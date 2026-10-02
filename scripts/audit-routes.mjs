import { chromium } from "@playwright/test";
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173";
const distDir = new URL("../dist/", import.meta.url).pathname;

function collectIndexRoutes(dir, routes = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) collectIndexRoutes(path, routes);
    else if (name === "index.html") {
      const folder = relative(distDir, dir).split(sep).join("/");
      routes.push(folder ? `/${folder}/` : "/");
    }
  }
  return routes;
}

const explicitRoutes = [
  "/pricing/", "/chat/", "/login/", "/terms/", "/privacy/", "/refund/",
  "/guides/move-to-portugal/", "/compare/portugal-vs-spain/", "/best/best-countries-2026/",
  "/help/", "/contact/", "/about/", "/mission/", "/cookie-policy/", "/data-security/",
  "/data-sources/", "/compliance/", "/dashboard/", "/dashboard/advisor/", "/dashboard/plan/",
  "/dashboard/checklist/", "/dashboard/documents/", "/dashboard/countries/",
];

const routes = [...new Set([...collectIndexRoutes(distDir), ...explicitRoutes])].sort();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const failures = [];
let currentRoute = "";

page.on("console", (msg) => {
  if (msg.type() === "error" && !msg.text().includes("favicon")) {
    failures.push({ route: currentRoute, type: "console", detail: msg.text().slice(0, 240) });
  }
});
page.on("pageerror", (error) => failures.push({ route: currentRoute, type: "pageerror", detail: error.message.slice(0, 240) }));

for (const route of routes) {
  currentRoute = route;
  try {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 15_000 });
    await page.waitForTimeout(650);
    const result = await page.evaluate(() => ({
      title: document.title,
      text: document.body.innerText.trim(),
      rootChildren: document.querySelector("#root")?.children.length ?? 0,
      hasNav: Boolean(document.querySelector("nav, header")),
      hasRawInlineMain: Boolean(document.querySelector('#root > main[style*="max-width"]')),
    }));
    if (!response || response.status() >= 400) failures.push({ route, type: "http", detail: String(response?.status() ?? "no response") });
    if (!result.text || result.rootChildren === 0) failures.push({ route, type: "empty", detail: result.title });
    if (result.hasRawInlineMain && !result.hasNav) failures.push({ route, type: "raw-prerender", detail: result.title });
    if (/404|page not found/i.test(result.title + " " + result.text.slice(0, 300)) && route !== "/404/") {
      failures.push({ route, type: "not-found", detail: result.title });
    }
  } catch (error) {
    failures.push({ route, type: "navigation", detail: error.message.slice(0, 240) });
  }
}

await browser.close();
console.log(JSON.stringify({ baseUrl, checked: routes.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
