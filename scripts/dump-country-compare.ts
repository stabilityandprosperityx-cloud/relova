/**
 * Emit JSON snapshots of Country Compare launch pairs for prerender-tools.mjs.
 * Run via: vite-node scripts/dump-country-compare.ts
 */
import { countryDatabase } from "../src/lib/countryMatching";
import { COMPARE_LAUNCH_PAIRS, countryComparePath } from "../src/lib/countryComparePairs";
import { COMPARE_ROWS } from "../src/lib/countryCompareRows";
import { citizenshipDemonym } from "../src/lib/demonyms";

const out = COMPARE_LAUNCH_PAIRS.map((pair) => {
  const a = countryDatabase.find((c) => c.name === pair.countryA);
  const b = countryDatabase.find((c) => c.name === pair.countryB);
  if (!a || !b) {
    throw new Error(`Missing profile for ${pair.countryA} or ${pair.countryB}`);
  }
  const rows = COMPARE_ROWS.map((row) => ({
    label: row.label,
    a: row.render(a),
    b: row.render(b),
    winner: row.winner(a, b),
  }));
  const demonym = pair.citizenship ? citizenshipDemonym(pair.citizenship) : null;
  const title = demonym
    ? `${pair.countryA} vs ${pair.countryB} for ${demonym} citizens`
    : `${pair.countryA} vs ${pair.countryB}`;
  return {
    path: countryComparePath(pair.countryA, pair.countryB, pair.citizenship),
    citizenship: pair.citizenship ?? null,
    demonym,
    countryA: pair.countryA,
    countryB: pair.countryB,
    flagA: a.flag,
    flagB: b.flag,
    title,
    rows,
  };
});

process.stdout.write(JSON.stringify(out));
