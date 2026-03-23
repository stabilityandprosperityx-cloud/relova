import LegalPage from "@/components/layout/LegalPage";

const sections = [
  {
    title: "OVERVIEW",
    content: [
      "At Relova AI, we want you to be satisfied with your subscription. This policy explains our refund terms.",
    ],
  },
  {
    title: "SUBSCRIPTION BILLING",
    content: [
      "Pro and Full plans are billed monthly in advance. Your subscription automatically renews each month until cancelled.",
    ],
  },
  {
    title: "CANCELLATION",
    content: [
      "You may cancel your subscription at any time from your account dashboard. After cancellation, you retain access to paid features until the end of your current billing period. No further charges will be made after cancellation.",
    ],
  },
  {
    title: "REFUND ELIGIBILITY",
    content: [
      "If you are not satisfied, contact us within 14 days of purchase for a full refund. No questions asked.",
    ],
  },
  {
    title: "HOW TO REQUEST A REFUND",
    content: [
      "Email support@relova.ai with: your account email, date of purchase, and reason for refund request.",
      "We will process eligible refunds within 5–10 business days. Refunds are returned to the original payment method.",
    ],
  },
  {
    title: "CONTACT",
    content: [
      "For refund requests or questions:",
      "Email: support@relova.ai",
    ],
  },
];

export default function Refund() {
  return <LegalPage title="Refund Policy" effectiveDate="March 23, 2026" sections={sections} />;
}
