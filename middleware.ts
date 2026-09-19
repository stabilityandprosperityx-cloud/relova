/**
 * Edge Middleware — real 404s for unknown paths on relova.ai.
 *
 * Why this exists: vercel.json rewrites every extension-less path to
 * /index.html (`"/((?!api/|.*\\.[a-zA-Z0-9]+$).*)"`), which is required for
 * client-side routing (react-router-dom) to work on refresh/deep-link. The
 * side effect: a path that matches NO real route — a typo, an old/removed
 * URL, a scanner probe, a stale backlink — also gets HTTP 200 with the SPA
 * shell instead of a real 404. Google Search Console has been recording a
 * large and growing "Discovered – currently not indexed" count (see GSC
 * Coverage export, Sept 2026: ~1,900 URLs, far more than this site's ~90
 * real routes) — the working theory is that this always-200 behavior is
 * why Google keeps queuing unknown URLs instead of dropping them.
 *
 * This middleware runs (per `config.matcher` below) only on paths that
 * vercel.json would otherwise rewrite to /index.html. It allowlists every
 * known route prefix and returns a real 404 for everything else, before
 * the SPA ever loads. Known static files (favicon.png, /images/*, etc.)
 * and /api/* are excluded from the matcher entirely and are untouched.
 *
 * IMPORTANT — test before merging to main:
 *   1. Deploy this branch to a Vercel preview (`vercel` from repo root, or
 *      push and let Vercel's Git integration build a preview — confirm
 *      which applies for this project).
 *   2. On the preview URL, confirm every real route still works:
 *      /, /pricing, /countries, /countries/portugal, /dashboard,
 *      /dashboard/advisor, /chat, /help, /contact, /terms, /privacy,
 *      /refund, /data-sources, /blog, /blog/some-post-slug,
 *      /guides/move-to-portugal, /compare/portugal-vs-spain,
 *      /best/best-countries-2026, /tools, /tools/can-i-move,
 *      /tools/can-i-move/russia/georgia, /tools/documents-needed/...,
 *      /tools/country-compare/..., /tools/invitation-letter,
 *      /tools/tax-residency-tracker.
 *   3. Confirm a made-up path (e.g. /this-does-not-exist-xyz) now returns
 *      HTTP 404, not 200.
 *   4. Only then merge to main and run `vercel --prod` (this repo has no
 *      Git auto-deploy — deploys are manual).
 *
 * If a new top-level route is added to src/App.tsx or a new /tools/*
 * prerender pair is added later, add its prefix to KNOWN_PREFIXES /
 * KNOWN_EXACT below in the same PR, or it will 404 here.
 */

// Exact paths (no trailing content after them)
const KNOWN_EXACT = new Set([
  "/",
  "/pricing",
  "/chat",
  "/help",
  "/contact",
  "/terms",
  "/privacy",
  "/refund",
  "/data-sources",
  "/countries",
  "/dashboard",
  "/blog",
  "/guides/move-to-portugal",
  "/compare/portugal-vs-spain",
  "/best/best-countries-2026",
]);

// Path prefixes that own their whole subtree (react-router nested routes,
// dynamic :slug segments, and the ~90 statically prerendered /tools pages
// written by scripts/prerender-tools.mjs).
const KNOWN_PREFIXES = [
  "/dashboard/", // dashboard sub-tabs (advisor, plan, checklist, documents, countries)
  "/countries/", // /countries/:slug
  "/blog/", // client-side redirect to blog.relova.ai/blog/:slug
  "/tools/", // can-i-move, where-should-i-move, documents-needed, country-compare,
  // invitation-letter, tax-residency-tracker + their prerendered pairs
];

function isKnownPath(pathname: string): boolean {
  if (KNOWN_EXACT.has(pathname)) return true;
  return KNOWN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function middleware(request: Request) {
  const { pathname } = new URL(request.url);
  if (isKnownPath(pathname)) {
    // Not our concern — let vercel.json's normal rewrite/static handling continue.
    return undefined;
  }
  return new Response("Not found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

// Only run on the same universe vercel.json would rewrite to /index.html:
// extension-less paths, excluding /api/. Real static files (favicon.png,
// /images/*, sitemap*.xml, robots.txt, JS/CSS bundles) never hit this —
// Vercel serves them from the filesystem before middleware/rewrites apply.
export const config = {
  matcher: "/((?!api/|.*\\.[a-zA-Z0-9]+$).*)",
};
