import { slugify } from "./toolSlugs";

export interface CanIMovePair {
  citizenship: string;
  destination: string;
}

/**
 * Launch / prerender pairs for Can I Move — 61 total (was 21). Keep in sync
 * with LAUNCH_PAIRS in scripts/prerender-tools.mjs (that copy also carries
 * the per-pair verdict/note text used on the static prerendered page; this
 * one is just the identity list, used for hub-page and data-sources
 * linking).
 */
export const CAN_I_MOVE_LAUNCH_PAIRS: CanIMovePair[] = [
  { citizenship: "Russia", destination: "Georgia" },
  { citizenship: "Russia", destination: "Armenia" },
  { citizenship: "Russia", destination: "Turkey" },
  { citizenship: "Russia", destination: "UAE" },
  { citizenship: "Russia", destination: "Cyprus" },
  { citizenship: "Russia", destination: "Portugal" },
  { citizenship: "Russia", destination: "Thailand" },
  { citizenship: "Russia", destination: "Serbia" },
  { citizenship: "Russia", destination: "Kazakhstan" },
  { citizenship: "Russia", destination: "Israel" },
  { citizenship: "United States", destination: "Mexico" },
  { citizenship: "United States", destination: "Portugal" },
  { citizenship: "United States", destination: "Canada" },
  { citizenship: "United States", destination: "Spain" },
  { citizenship: "United States", destination: "Costa Rica" },
  { citizenship: "United States", destination: "Panama" },
  { citizenship: "United Kingdom", destination: "Ireland" },
  { citizenship: "United Kingdom", destination: "Spain" },
  { citizenship: "United Kingdom", destination: "Portugal" },
  { citizenship: "United Kingdom", destination: "Australia" },
  { citizenship: "United Kingdom", destination: "Canada" },
  { citizenship: "India", destination: "United States" },
  { citizenship: "India", destination: "UAE" },
  { citizenship: "India", destination: "Canada" },
  { citizenship: "India", destination: "United Kingdom" },
  { citizenship: "India", destination: "Australia" },
  { citizenship: "China", destination: "Singapore" },
  { citizenship: "China", destination: "Japan" },
  { citizenship: "China", destination: "United States" },
  { citizenship: "China", destination: "Canada" },
  { citizenship: "China", destination: "Australia" },
  { citizenship: "Brazil", destination: "Portugal" },
  { citizenship: "Brazil", destination: "Spain" },
  { citizenship: "Brazil", destination: "United States" },
  { citizenship: "Brazil", destination: "Italy" },
  { citizenship: "Brazil", destination: "Japan" },
  { citizenship: "Nigeria", destination: "United Kingdom" },
  { citizenship: "Nigeria", destination: "Canada" },
  { citizenship: "Nigeria", destination: "United States" },
  { citizenship: "Nigeria", destination: "Australia" },
  { citizenship: "Nigeria", destination: "Ghana" },
  { citizenship: "Philippines", destination: "UAE" },
  { citizenship: "Philippines", destination: "Canada" },
  { citizenship: "Philippines", destination: "United States" },
  { citizenship: "Philippines", destination: "Saudi Arabia" },
  { citizenship: "Russia", destination: "Montenegro" },
  { citizenship: "Russia", destination: "Indonesia" },
  { citizenship: "United States", destination: "Italy" },
  { citizenship: "United States", destination: "Colombia" },
  { citizenship: "United Kingdom", destination: "UAE" },
  { citizenship: "United Kingdom", destination: "New Zealand" },
  { citizenship: "India", destination: "Germany" },
  { citizenship: "India", destination: "Singapore" },
  { citizenship: "China", destination: "Thailand" },
  { citizenship: "China", destination: "New Zealand" },
  { citizenship: "Brazil", destination: "Canada" },
  { citizenship: "Brazil", destination: "United Kingdom" },
  { citizenship: "Nigeria", destination: "Ireland" },
  { citizenship: "Nigeria", destination: "Germany" },
  { citizenship: "Philippines", destination: "Australia" },
  { citizenship: "Philippines", destination: "Japan" },
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
