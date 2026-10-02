/**
 * Vite copies public/ before post-build prerendering. The tools prerenderer
 * intentionally generates SEO shells for dynamic tool routes, but its hub
 * output would otherwise replace the approved visual redesign at /tools/.
 * Restore only the approved hub after dynamic routes have been generated.
 * Countries are already copied verbatim from public/ and are not prerendered.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
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
