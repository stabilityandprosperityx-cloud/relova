import { determineVisaType } from "./determineVisaType";
import { slugify } from "./toolSlugs";
import {
  DOCUMENTS_LAUNCH_PAIRS as RAW_DOCUMENTS_LAUNCH_PAIRS,
  CAN_I_MOVE_CROSSLINK_PAIRS as RAW_CAN_I_MOVE_CROSSLINK_PAIRS,
} from "./documentsNeededPairsData.mjs";

export interface DocumentsLaunchPair {
  citizenship: string;
  destination: string;
  visa_type: string;
}

/**
 * Launch pairs for /tools/documents-needed (warm + prerender). The actual
 * data lives in documentsNeededPairsData.mjs — a plain-JS file so
 * scripts/prerender-tools.mjs and scripts/warm-document-checklist.mjs can
 * import the exact same list without a build step. Edit that file, not
 * this one, to add/remove a pair.
 */
export const DOCUMENTS_LAUNCH_PAIRS: DocumentsLaunchPair[] = RAW_DOCUMENTS_LAUNCH_PAIRS;

/** can-i-move pairs that also have a documents-needed launch page. */
export const CAN_I_MOVE_CROSSLINK_PAIRS: readonly (readonly [string, string])[] =
  RAW_CAN_I_MOVE_CROSSLINK_PAIRS as readonly (readonly [string, string])[];

/** Short label for Popular links. */
export function shortCitizenshipLabel(citizenship: string): string {
  if (citizenship === "United States") return "US";
  if (citizenship === "United Kingdom") return "UK";
  return citizenship;
}

/**
 * Offline fallback for Popular links: at most one destination per citizenship.
 * Prefer non-Russia citizenships first so the default list isn't Russia-skewed.
 */
export function pickDiversePopularPairs(
  pairs: DocumentsLaunchPair[],
  limit = 5,
): DocumentsLaunchPair[] {
  const russia: DocumentsLaunchPair[] = [];
  const others: DocumentsLaunchPair[] = [];
  for (const p of pairs) {
    if (p.citizenship === "Russia") russia.push(p);
    else others.push(p);
  }

  const ordered = [...others, ...russia];
  const seen = new Set<string>();
  const out: DocumentsLaunchPair[] = [];
  for (const p of ordered) {
    if (seen.has(p.citizenship)) continue;
    seen.add(p.citizenship);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

export function hasDocumentsNeededPage(citizenship: string, destination: string): boolean {
  return DOCUMENTS_LAUNCH_PAIRS.some(
    (p) => p.citizenship === citizenship && p.destination === destination,
  );
}

export function hasCanIMoveCrosslink(citizenship: string, destination: string): boolean {
  return CAN_I_MOVE_CROSSLINK_PAIRS.some(
    ([c, d]) => c === citizenship && d === destination,
  );
}

export function documentsNeededPath(citizenship: string, destination: string): string {
  return `/tools/documents-needed/${slugify(citizenship)}/${slugify(destination)}`;
}

export function canIMovePath(citizenship: string, destination: string): string {
  return `/tools/can-i-move/${slugify(citizenship)}/${slugify(destination)}`;
}

/** Assert launch visa_types match determineVisaType for destinations. */
export function assertLaunchVisaTypes(): void {
  for (const p of DOCUMENTS_LAUNCH_PAIRS) {
    const expected = determineVisaType(p.destination);
    if (expected !== p.visa_type) {
      console.warn(
        `documents launch pair mismatch: ${p.citizenship}→${p.destination} expected ${expected}, got ${p.visa_type}`,
      );
    }
  }
}
