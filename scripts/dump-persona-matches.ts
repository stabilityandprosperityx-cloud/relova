/**
 * Build helper: dump persona match snapshots as JSON for prerender-tools.mjs.
 * Run via: npx vite-node scripts/dump-persona-matches.ts
 */
import { MOVE_AS_PERSONAS, getPersonaMatches } from "../src/lib/moveAsPersonas";

const snapshot = MOVE_AS_PERSONAS.map((persona) => {
  const matches = getPersonaMatches(persona, 8);
  return {
    slug: persona.slug,
    displayName: persona.displayName,
    pageTitle: persona.pageTitle,
    metaDescription: persona.metaDescription,
    intro: persona.intro,
    topCountries: matches.map((m) => ({
      name: m.country.name,
      flag: m.country.flag,
      score: m.score,
      difficulty: m.difficulty,
      stabilityMonths: m.country.stabilityMonths,
      topRisk: m.topRisk,
      reasons: m.reasons,
    })),
  };
});

process.stdout.write(JSON.stringify(snapshot));
