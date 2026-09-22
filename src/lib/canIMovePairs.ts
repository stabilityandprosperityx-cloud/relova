import { slugify } from "./toolSlugs";

export interface CanIMovePair {
  citizenship: string;
  destination: string;
}

/**
 * Launch / prerender pairs for Can I Move — 21 total. Keep in sync with
 * LAUNCH_PAIRS in scripts/prerender-tools.mjs (that copy also carries the
 * per-pair verdict/note text used on the static prerendered page; this one
 * is just the identity list, used for hub-page and data-sources linking).
 */
export const CAN_I_MOVE_LAUNCH_PAIRS: CanIMovePair[] = [
  { citizenship: "Russia", destination: "Georgia" },
  { citizenship: "Russia", destination: "Armenia" },
  { citizenship: "Russia", destination: "Turkey" },
  { citizenship: "Russia", destination: "UAE" },
  { citizenship: "Russia", destination: "Cyprus" },
  { citizenship: "Russia", destination: "Portugal" },
  { citizenship: "Russia", destination: "Thailand" },
  { citizenship: "United States", destination: "Mexico" },
  { citizenship: "United States", destination: "Portugal" },
  { citizenship: "United Kingdom", destination: "Ireland" },
  { citizenship: "United Kingdom", destination: "Spain" },
  { citizenship: "India", destination: "United States" },
  { citizenship: "India", destination: "UAE" },
  { citizenship: "China", destination: "Singapore" },
  { citizenship: "China", destination: "Japan" },
  { citizenship: "Brazil", destination: "Portugal" },
  { citizenship: "Brazil", destination: "Spain" },
  { citizenship: "Nigeria", destination: "United Kingdom" },
  { citizenship: "Nigeria", destination: "Canada" },
  { citizenship: "Philippines", destination: "UAE" },
  { citizenship: "Philippines", destination: "Canada" },
];

export function canIMovePath(citizenship: string, destination: string): string {
  return `/tools/can-i-move/${slugify(citizenship)}/${slugify(destination)}`;
}

export function shortCitizenshipLabel(citizenship: string): string {
  if (citizenship === "United States") return "US";
  if (citizenship === "United Kingdom") return "UK";
  return citizenship;
}

/** Groups pairs by citizenship, preserving first-seen order. */
export function groupByCitizenship(pairs: CanIMovePair[]): { citizenship: string; destinations: string[] }[] {
  const order: string[] = [];
  const map = new Map<string, string[]>();
  for (const p of pairs) {
    if (!map.has(p.citizenship)) {
      map.set(p.citizenship, []);
      order.push(p.citizenship);
    }
    map.get(p.citizenship)!.push(p.destination);
  }
  return order.map((citizenship) => ({ citizenship, destinations: map.get(citizenship)! }));
}
