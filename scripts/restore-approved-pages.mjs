/**
 * Vite copies public/ before post-build prerendering. The tools prerenderer
 * intentionally generates SEO shells for dynamic tool routes, but its hub
 * output would otherwise replace the approved visual redesign at /tools/.
 * Restore only the approved hub after dynamic routes have been generated.
 * Countries are already copied verbatim from public/ and are not prerendered.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const route of ["tools"]) {
  const source = join(root, "public", route, "index.html");
  const target = join(root, "dist", route, "index.html");
  if (!existsSync(source)) {
    throw new Error(`Approved page is missing: ${source}`);
  }
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  console.log(`restore-approved-pages: restored /${route}/`);
}

// Keep the favicon consistent across the static redesign and React-rendered
// utility pages without having to duplicate the same markup edit in every
// country file.
function updateFavicons(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      updateFavicons(path);
    } else if (entry.name.endsWith(".html")) {
      const source = readFileSync(path, "utf8");
      const updated = source
        .replaceAll("assets/favicon.svg", "assets/favicon.png?v=6")
        .replace(/type="image\/svg\+xml"(?=[^>]*favicon\.png)/g, 'type="image/png"')
        // Authentication belongs on dedicated auth routes. Keep the demo/chat
        // route for product exploration, but never use it as the header signup.
        .replaceAll('href="https://relova.ai/chat">Get started', 'href="https://relova.ai/signup">Get started')
        .replaceAll('href="https://relova.ai/chat">Get Started', 'href="https://relova.ai/signup">Get Started');
      if (updated !== source) writeFileSync(path, updated, "utf8");
    }
  }
}

updateFavicons(join(root, "dist"));
console.log("restore-approved-pages: applied the new favicon across all pages");
