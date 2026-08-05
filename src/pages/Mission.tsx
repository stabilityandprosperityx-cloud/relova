import LegalPage from "@/components/layout/LegalPage";
import SEO from "@/components/SEO";

const sections = [
  {
    title: "WHY RELOVA EXISTS",
    content: [
      "Relocation is one of life's most consequential decisions. The information needed to do it well is often scattered across outdated blog posts, opaque government sites, and advice that only becomes available after you hire expensive lawyers or consultants.",
      "Relova's mission is to make accurate, personalized relocation guidance more accessible — so people can understand options, documents, and next steps earlier, with less confusion.",
    ],
  },
  {
    title: "WHAT WE BELIEVE",
    content: [
      "Clarity should not be a luxury product. People deserve tools that respect their passport, budget, family situation, and goals — and that stay honest about uncertainty.",
      "Relova provides informational planning tools. It is not a law firm, immigration practice, or financial advisory service. Always verify visa, residency, tax, and legal requirements with official government sources and licensed professionals before you act.",
    ],
  },
];

export default function Mission() {
  return (
    <>
      <SEO
        title="Our Mission — Relova"
        description="Relova exists to make personalized relocation guidance more accessible — without overselling certainty or replacing licensed professional advice."
        canonical="https://relova.ai/mission"
      />
      <LegalPage title="Our Mission" effectiveDate="August 5, 2026" sections={sections} />
    </>
  );
}
