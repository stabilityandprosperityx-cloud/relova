import { determineVisaType } from "./determineVisaType";
import { slugify } from "./toolSlugs";

export interface DocumentsLaunchPair {
  citizenship: string;
  destination: string;
  visa_type: string;
}

/** 15 launch pairs for /tools/documents-needed (warm + prerender). */
export const DOCUMENTS_LAUNCH_PAIRS: DocumentsLaunchPair[] = [
  { citizenship: "Russia", destination: "Portugal", visa_type: "D8_Digital_Nomad" },
  { citizenship: "Russia", destination: "Armenia", visa_type: "Visa_Free" },
  { citizenship: "Russia", destination: "Cyprus", visa_type: "Digital_Nomad" },
  { citizenship: "Russia", destination: "Czech Republic", visa_type: "Long_Term_Residence" },
  { citizenship: "Russia", destination: "Montenegro", visa_type: "Temporary_Residence" },
  { citizenship: "Russia", destination: "Georgia", visa_type: "Visa_Free" },
  { citizenship: "Russia", destination: "Turkey", visa_type: "Residence_Permit" },
  { citizenship: "Russia", destination: "UAE", visa_type: "Freelance_Permit" },
  { citizenship: "Russia", destination: "Thailand", visa_type: "DTV" },
  { citizenship: "United States", destination: "Portugal", visa_type: "D8_Digital_Nomad" },
  { citizenship: "United States", destination: "Mexico", visa_type: "Temporary_Resident" },
  { citizenship: "United Kingdom", destination: "Spain", visa_type: "Digital_Nomad" },
  { citizenship: "India", destination: "UAE", visa_type: "Freelance_Permit" },
  { citizenship: "Brazil", destination: "Portugal", visa_type: "D8_Digital_Nomad" },
  { citizenship: "China", destination: "Japan", visa_type: "Digital_Nomad" },
];

/** can-i-move pairs that also have a documents-needed launch page. */
export const CAN_I_MOVE_CROSSLINK_PAIRS = [
  ["Russia", "Portugal"],
  ["Russia", "Armenia"],
  ["Russia", "Cyprus"],
  ["Russia", "Georgia"],
  ["Russia", "Turkey"],
  ["Russia", "UAE"],
  ["Russia", "Thailand"],
  ["United States", "Portugal"],
  ["United States", "Mexico"],
  ["United Kingdom", "Spain"],
  ["India", "UAE"],
  ["Brazil", "Portugal"],
  ["China", "Japan"],
] as const;

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
