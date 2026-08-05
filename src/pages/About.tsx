import LegalPage from "@/components/layout/LegalPage";
import SEO from "@/components/SEO";

const sections = [
  {
    title: "WHAT RELOVA IS",
    content: [
      "Relova is an all-in-one relocation planning platform. We help people figure out where they could move, what documents they typically need, and how to turn a scattered research process into a clearer plan — without pretending the internet can replace a licensed immigration lawyer.",
      "The product combines country matching, document checklists, an AI-assisted Relocation Expert, and an optional Concierge path for people who want more hands-on support.",
    ],
  },
  {
    title: "WHO IT'S FOR",
    content: [
      "Relova is built for people considering an international move for work, family, lifestyle, or safety reasons — freelancers, remote workers, families, and anyone trying to compare destinations with their actual passport and constraints in mind.",
      "If you are looking for a single place to organize the questions that usually live across forums, government PDFs, and expensive consultations, Relova is meant to make that starting point clearer.",
    ],
  },
  {
    title: "HOW WE APPROACH IT",
    content: [
      "Relocation is consequential and often overwhelming. Our goal is not to oversell certainty — it is to reduce noise: better shortlists, more specific document guidance, and a plan you can actually follow while still verifying requirements with official sources and qualified professionals.",
    ],
  },
  {
    title: "GET IN TOUCH",
    content: [
      "Questions about the product or your account: support@relova.ai, or visit relova.ai/contact.",
    ],
  },
];

export default function About() {
  return (
    <>
      <SEO
        title="About Us — Relova"
        description="Relova is a relocation planning platform for country matching, document checklists, and AI-assisted guidance — built to make international moves clearer."
        canonical="https://relova.ai/about"
      />
      <LegalPage title="About Us" effectiveDate="August 5, 2026" sections={sections} />
    </>
  );
}
