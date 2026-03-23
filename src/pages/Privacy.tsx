import LegalPage from "@/components/layout/LegalPage";

const sections = [
  {
    title: "INTRODUCTION",
    content: [
      'Relova AI ("we", "us", "our") is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights.',
    ],
  },
  {
    title: "INFORMATION WE COLLECT",
    content: [
      "Information you provide: name and email address (on registration), citizenship and target country, relocation goals and budget, documents you upload, and messages sent to our AI.",
      "Information collected automatically: usage data (pages visited, features used), device information and IP address, cookies and similar tracking technologies.",
    ],
  },
  {
    title: "HOW WE USE YOUR INFORMATION",
    content: [
      "We use your information to provide and personalize the Service, generate your relocation plan and AI recommendations, process payments via Paddle, send service-related emails, improve the Service, and comply with legal obligations.",
      "We do not sell your personal data to third parties. We do not use your data for advertising purposes.",
    ],
  },
  {
    title: "DATA SHARING",
    content: [
      "We share data only with: Paddle.com for payment processing, Supabase for secure data storage, and AI providers to generate responses (data is not stored by AI providers for training purposes).",
    ],
  },
  {
    title: "DATA STORAGE AND SECURITY",
    content: [
      "Your data is stored securely using industry-standard infrastructure. We use encryption for data in transit and at rest. Documents you upload are stored in private, access-controlled storage.",
    ],
  },
  {
    title: "DATA RETENTION",
    content: [
      "We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law.",
    ],
  },
  {
    title: "YOUR RIGHTS",
    content: [
      "You have the right to: access your personal data, correct inaccurate data, delete your account and data, export your data, and withdraw consent at any time.",
      "To exercise these rights, contact support@relova.ai",
    ],
  },
  {
    title: "COOKIES",
    content: [
      "We use essential cookies for authentication and session management. We do not use advertising cookies. You can disable cookies in your browser settings, but this may affect functionality.",
    ],
  },
  {
    title: "CHILDREN'S PRIVACY",
    content: [
      "The Service is not directed to children under 18. We do not knowingly collect data from children.",
    ],
  },
  {
    title: "CHANGES TO THIS POLICY",
    content: [
      "We may update this Privacy Policy. We will notify you of material changes by email or prominent notice on the site.",
    ],
  },
  {
    title: "CONTACT",
    content: [
      "For privacy questions or data requests:",
      "Email: support@relova.ai",
      "Website: relova.ai/privacy",
    ],
  },
];

export default function Privacy() {
  return <LegalPage title="Privacy Policy" effectiveDate="March 23, 2026" sections={sections} />;
}
