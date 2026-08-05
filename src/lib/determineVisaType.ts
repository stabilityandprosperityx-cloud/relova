/** Shared destination → typical visa pathway for Relova tools & onboarding. */
export function determineVisaType(country: string): string {
  const visaMap: Record<string, string> = {
    // EUROPE — Digital Nomad & Residence Visas
    Portugal: "D8_Digital_Nomad",
    Spain: "Digital_Nomad",
    Germany: "Freelance_Visa",
    Italy: "Digital_Nomad",
    Greece: "Digital_Nomad",
    Croatia: "Digital_Nomad",
    "Czech Republic": "Long_Term_Residence",
    Hungary: "White_Card",
    Malta: "Nomad_Residence_Permit",
    Cyprus: "Digital_Nomad",
    Estonia: "Digital_Nomad",
    Netherlands: "Highly_Skilled_Migrant",
    France: "Talent_Passport",
    Austria: "Red_White_Red_Card",
    Poland: "Temporary_Residence",
    Bulgaria: "Digital_Nomad",
    Serbia: "Temporary_Residence",
    Montenegro: "Temporary_Residence",
    Albania: "Visa_Free",
    Switzerland: "Work_Permit_B",
    Norway: "Skilled_Worker",
    Sweden: "Work_Permit",
    Denmark: "Pay_Limit_Scheme",
    Finland: "Work_Permit",
    Ireland: "Critical_Skills",
    Belgium: "Single_Permit",
    Romania: "Digital_Nomad",
    Slovakia: "Temporary_Residence",
    Slovenia: "Temporary_Residence",

    // MIDDLE EAST
    UAE: "Freelance_Permit",
    Turkey: "Residence_Permit",
    Israel: "Work_Visa",
    "Saudi Arabia": "Work_Visa",
    Qatar: "Work_Visa",
    Bahrain: "Digital_Nomad",

    // CAUCASUS & CENTRAL ASIA
    Georgia: "Visa_Free",
    Armenia: "Visa_Free",
    Kazakhstan: "Temporary_Residence",
    Uzbekistan: "Temporary_Stay",

    // ASIA
    Thailand: "DTV",
    "Bali / Indonesia": "Social_Visa",
    Indonesia: "Social_Visa",
    Vietnam: "E_Visa",
    Malaysia: "DE_Rantau",
    Japan: "Digital_Nomad",
    Singapore: "Employment_Pass",
    "South Korea": "Workcation_Visa",
    Philippines: "Digital_Nomad",
    Taiwan: "Gold_Card",
    "Hong Kong": "Quality_Migrant",

    // AMERICAS
    Mexico: "Temporary_Resident",
    Colombia: "Digital_Nomad",
    Brazil: "Digital_Nomad",
    Argentina: "Rentista",
    Panama: "Friendly_Nations",
    "Costa Rica": "Rentista",
    Ecuador: "Professional_Visa",
    Chile: "Temporary_Residence",
    Uruguay: "Temporary_Residence",
    Canada: "Express_Entry",
    "United States": "Work_Visa",
    "United Kingdom": "Temporary_Residence",

    // AFRICA & ISLANDS
    "South Africa": "Critical_Skills",
    Morocco: "Residence_Permit",
    Mauritius: "Premium_Visa",
    "Cape Verde": "Digital_Nomad",
    Seychelles: "Workcation",

    // PACIFIC & OTHER
    Australia: "Skilled_Nominated",
    "New Zealand": "Skilled_Migrant",
  };

  return visaMap[country] || "Temporary_Residence";
}

/** Human-readable label for visa_type codes. */
export function formatVisaTypeLabel(visaType: string): string {
  return visaType.replace(/_/g, " ");
}
