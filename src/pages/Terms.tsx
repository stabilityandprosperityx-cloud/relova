import LegalPage from "@/components/layout/LegalPage";

const sections = [
  {
    title: "ACCEPTANCE OF TERMS",
    content: [
      'By accessing or using Relova AI ("Service"), you agree to be bound by these Terms. If you disagree, do not use the Service.',
    ],
  },
  {
    title: "DESCRIPTION OF SERVICE",
    content: [
      "Relova AI is an AI-powered relocation planning platform that provides personalized country recommendations, visa guidance, document checklists, and relocation roadmaps. The Service is informational only and does not constitute legal, immigration, tax, or financial advice.",
    ],
  },
  {
    title: "USER ACCOUNTS",
    content: [
      "You must provide accurate information when creating an account. You are responsible for maintaining the security of your password. You must be at least 18 years old to use the Service. One person may not maintain more than one free account.",
    ],
  },
  {
    title: "SUBSCRIPTION PLANS AND BILLING",
    content: [
      "Free Plan: Limited to 3 AI questions total.",
      "Pro Plan: $19/month, unlimited AI questions and personalized guidance.",
      "Full Plan: $49/month, complete relocation system including document checklists, timelines, and tax strategy guidance.",
      "Subscriptions are billed monthly in advance. Payments are processed by Paddle.com who acts as Merchant of Record. Your subscription renews automatically unless cancelled.",
    ],
  },
  {
    title: "CANCELLATION",
    content: [
      "You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until the period ends.",
    ],
  },
  {
    title: "REFUNDS",
    content: ["See our Refund Policy at relova.ai/refund"],
  },
  {
    title: "ACCEPTABLE USE",
    content: [
      "You agree not to: use the Service for any illegal purpose; attempt to gain unauthorized access to any part of the Service; share your account credentials with others; scrape, copy, or redistribute content from the Service; use automated tools to access the Service.",
    ],
  },
  {
    title: "INTELLECTUAL PROPERTY",
    content: [
      "All content, features, and functionality of the Service are owned by Relova AI and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without written permission.",
    ],
  },
  {
    title: "DISCLAIMER OF WARRANTIES",
    content: [
      'The Service is provided "as is" without warranties of any kind. Relova AI makes no warranty that the Service will be uninterrupted, error-free, or that information provided is current or accurate. Always verify visa and immigration information with qualified legal professionals.',
    ],
  },
  {
    title: "LIMITATION OF LIABILITY",
    content: [
      "To the maximum extent permitted by law, Relova AI shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.",
    ],
  },
  {
    title: "CHANGES TO TERMS",
    content: [
      "We may update these Terms at any time. We will notify you of significant changes by email. Continued use of the Service after changes constitutes acceptance.",
    ],
  },
  {
    title: "GOVERNING LAW",
    content: [
      "These Terms are governed by the laws of Georgia (country). Disputes shall be resolved in the courts of Tbilisi, Georgia.",
    ],
  },
  {
    title: "CONTACT",
    content: [
      "For questions about these Terms:",
      "Email: support@relova.ai",
      "Website: relova.ai",
    ],
  },
];

export default function Terms() {
  return <LegalPage title="Terms of Service" effectiveDate="March 23, 2026" sections={sections} />;
}
