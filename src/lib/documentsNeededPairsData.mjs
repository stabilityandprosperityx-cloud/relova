/**
 * Single source of truth for the Documents Needed launch pairs and their
 * Can I Move crosslinks. Plain ESM (no TypeScript syntax) so it can be
 * imported directly by:
 *  - src/lib/documentsNeededPairs.ts (the app, via Vite's bundler resolution)
 *  - scripts/prerender-tools.mjs (plain `node`, no build step)
 *  - scripts/warm-document-checklist.mjs (plain `node`, no build step)
 *
 * Previously this list was hand-maintained as three separate copies across
 * those files, which had to be kept in sync manually on every addition.
 * Edit ONLY this file when adding/removing a Documents Needed pair.
 */

/** @type {{ citizenship: string, destination: string, visa_type: string }[]} */
export const DOCUMENTS_LAUNCH_PAIRS = [
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
  { citizenship: "India", destination: "Germany", visa_type: "Freelance_Visa" },
  { citizenship: "Brazil", destination: "Portugal", visa_type: "D8_Digital_Nomad" },
  { citizenship: "Brazil", destination: "Spain", visa_type: "Digital_Nomad" },
  { citizenship: "China", destination: "Japan", visa_type: "Digital_Nomad" },
  { citizenship: "China", destination: "Singapore", visa_type: "Employment_Pass" },
  { citizenship: "Nigeria", destination: "United Kingdom", visa_type: "Temporary_Residence" },
  { citizenship: "Nigeria", destination: "Canada", visa_type: "Express_Entry" },
  { citizenship: "Philippines", destination: "UAE", visa_type: "Freelance_Permit" },
  { citizenship: "Philippines", destination: "Canada", visa_type: "Express_Entry" },
  { citizenship: "Germany", destination: "Portugal", visa_type: "D8_Digital_Nomad" },
  { citizenship: "United States", destination: "Canada", visa_type: "Express_Entry" },
  { citizenship: "United Kingdom", destination: "Portugal", visa_type: "D8_Digital_Nomad" },
  { citizenship: "India", destination: "Canada", visa_type: "Express_Entry" },
  { citizenship: "Philippines", destination: "Australia", visa_type: "Skilled_Nominated" },
  { citizenship: "Russia", destination: "Serbia", visa_type: "Temporary_Residence" },
  { citizenship: "United States", destination: "Spain", visa_type: "Digital_Nomad" },
  { citizenship: "Brazil", destination: "Canada", visa_type: "Express_Entry" },
  { citizenship: "Nigeria", destination: "Australia", visa_type: "Skilled_Nominated" },
];

/** can-i-move pairs that also have a documents-needed launch page. @type {[string, string][]} */
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
  ["Nigeria", "United Kingdom"],
  ["Nigeria", "Canada"],
  ["Philippines", "UAE"],
  ["Philippines", "Canada"],
  ["Brazil", "Spain"],
  ["China", "Singapore"],
  ["United States", "Canada"],
  ["United Kingdom", "Portugal"],
  ["India", "Canada"],
  ["Philippines", "Australia"],
  ["Russia", "Serbia"],
  ["United States", "Spain"],
  ["Brazil", "Canada"],
  ["Nigeria", "Australia"],
];
