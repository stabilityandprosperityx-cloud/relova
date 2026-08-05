import LegalPage from "@/components/layout/LegalPage";
import SEO from "@/components/SEO";

const sections = [
  {
    title: "OVERVIEW",
    content: [
      "Relova takes practical steps to protect account data, uploaded documents, and service communications. This page summarizes how we handle security with our current stack. It is not a certification claim (for example, we do not claim SOC 2 or ISO certification on this page).",
    ],
  },
  {
    title: "WHERE DATA LIVES",
    content: [
      "Application data is stored in Supabase (Postgres) with row-level security policies that restrict what authenticated users can access.",
      "Uploaded documents (such as passport or supporting-document files) are stored in a private Supabase Storage bucket (user-documents). Files are not publicly listed; access is mediated through the authenticated app (for example signed URLs for viewing).",
      "Payments are processed by Paddle. Relova does not store full card numbers on our own servers — card entry and payment compliance are handled in Paddle's checkout.",
      "AI-powered features (chat, matching explanations, document checks, and related generation) call Anthropic's API. Consistent with our Privacy Policy, we share data with AI providers to generate responses and those providers are not used by us as a channel to sell your personal data.",
      "Transactional emails (such as purchase confirmations) are sent via Resend.",
    ],
  },
  {
    title: "ENCRYPTION AND ACCESS",
    content: [
      "Traffic to relova.ai and our APIs is served over HTTPS, so data is encrypted in transit between your browser and our infrastructure.",
      "Access to production systems is limited to operators who need it to run the Service. User-facing data access is gated by authentication and database/storage policies.",
    ],
  },
  {
    title: "DOCUMENT CHECKS",
    content: [
      "When you upload an image for an AI visual check, our verification flow asks the model to assess document type, apparent validity/quality, and obvious mismatches — and instructs it not to read, transcribe, or repeat personal data such as names, ID numbers, dates of birth, nationality, or addresses.",
      "This is a convenience check for planning, not government identity verification and not a guarantee of document acceptance by any authority.",
    ],
  },
  {
    title: "ACCOUNT AND DATA DELETION",
    content: [
      "There is not currently a one-click delete-account control in the dashboard sidebar. To request deletion of your account and associated personal data, contact us via relova.ai/contact or email support@relova.ai.",
      "As stated in our Privacy Policy, when an account deletion request is completed we aim to delete personal data within 30 days, except where retention is required by law.",
    ],
  },
  {
    title: "REPORTING CONCERNS",
    content: [
      "If you believe there is a security issue affecting Relova accounts or data, please email support@relova.ai with details so we can investigate.",
    ],
  },
];

export default function DataSecurity() {
  return (
    <>
      <SEO
        title="Data Security — Relova"
        description="How Relova protects account data and uploaded documents: Supabase storage, HTTPS, Paddle payments, Anthropic AI processing, and deletion requests."
        canonical="https://relova.ai/data-security"
      />
      <LegalPage title="Data Security" effectiveDate="August 5, 2026" sections={sections} />
    </>
  );
}
