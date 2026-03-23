import LegalPage from "@/components/layout/LegalPage";

const sections = [
  {
    title: "OVERVIEW",
    content: [
      "Relova AI payments are processed by Paddle.com, our Merchant of Record. Paddle handles all payments, refunds, and customer billing on our behalf.",
    ],
  },
  {
    title: "14-DAY MONEY-BACK GUARANTEE",
    content: [
      "You are entitled to a full refund within 14 days of your purchase date, no questions asked.",
      "To request a refund, contact us at: support@relova.ai",
      "Or contact Paddle directly at: paddle.net",
    ],
  },
  {
    title: "SUBSCRIPTIONS",
    content: [
      "You may cancel your subscription at any time. After cancellation, you retain access to your plan until the end of the current billing period. No further charges will be made after cancellation.",
    ],
  },
  {
    title: "REFUND PROCESSING",
    content: [
      "Approved refunds are returned to the original payment method within 5-10 business days.",
    ],
  },
  {
    title: "CONTACT",
    content: [
      "For billing questions or refund requests:",
      "Email: support@relova.ai",
    ],
  },
];

export default function Refund() {
  return <LegalPage title="Refund Policy" effectiveDate="March 23, 2026" sections={sections} />;
}
