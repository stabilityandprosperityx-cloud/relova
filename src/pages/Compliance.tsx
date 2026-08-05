import LegalPage from "@/components/layout/LegalPage";
import SEO from "@/components/SEO";

const sections = [
  {
    title: "INFORMATIONAL SERVICE — NOT LICENSED ADVICE",
    content: [
      "Relova is a relocation planning platform. We are not a licensed immigration law firm, tax practice, or financial advisory firm.",
      "The Service provides informational and planning tools — country matching, checklists, timelines, and AI-assisted guidance. It does not constitute legal, immigration, tax, or financial advice.",
      "Always verify visa, residency, tax, and legal requirements with official government sources and qualified licensed professionals before making decisions or submitting applications.",
    ],
  },
  {
    title: "PAYMENTS AND MERCHANT OF RECORD",
    content: [
      "Subscriptions and paid plans are processed by Paddle.com, which acts as Merchant of Record. As described in our Terms of Service and Refund Policy, Paddle handles payment collection, related tax handling for eligible transactions, and customer billing operations on Relova's behalf.",
      "Because card payments run through Paddle's checkout, Relova does not store full payment card details on our own systems. Payment-card security obligations for the checkout experience are addressed within Paddle's compliance program (including PCI-DSS responsibilities applicable to their role).",
    ],
  },
  {
    title: "PRIVACY AND GDPR-ORIENTED HANDLING",
    content: [
      "Our Privacy Policy describes what we collect, how we use it, retention, and rights such as access, correction, and deletion requests (including for users in the EU/EEA where those rights apply).",
      "To exercise privacy rights or ask about data handling, contact support@relova.ai or use relova.ai/contact.",
    ],
  },
  {
    title: "MARKETING AND TRACKING DISCLOSURE",
    content: [
      "We use the Meta Pixel for advertising measurement, as described in our Cookie Policy. We do not currently show a cookie consent banner; see relova.ai/cookie-policy for details on cookies and similar technologies.",
    ],
  },
  {
    title: "CONTACT",
    content: [
      "Compliance or policy questions: support@relova.ai",
      "Related pages: Privacy Policy (relova.ai/privacy), Terms of Service (relova.ai/terms), Cookie Policy (relova.ai/cookie-policy), Data Security (relova.ai/data-security).",
    ],
  },
];

export default function Compliance() {
  return (
    <>
      <SEO
        title="Compliance — Relova"
        description="Relova provides informational relocation tools, not licensed legal advice. Payments via Paddle as Merchant of Record; privacy rights via support@relova.ai."
        canonical="https://relova.ai/compliance"
      />
      <LegalPage title="Compliance" effectiveDate="August 5, 2026" sections={sections} />
    </>
  );
}
