import LegalPage from "@/components/layout/LegalPage";
import SEO from "@/components/SEO";

const sections = [
  {
    title: "INTRODUCTION",
    content: [
      'This Cookie Policy explains how Relova ("we", "us", "our") uses cookies and similar technologies on relova.ai. It should be read alongside our Privacy Policy at relova.ai/privacy.',
    ],
  },
  {
    title: "COOKIES VS. SIMILAR TECHNOLOGIES",
    content: [
      "Cookies are small text files stored by your browser. We also use related browser storage such as localStorage for preferences and session data. localStorage is not a cookie, but we mention it here for transparency because it can store information on your device.",
    ],
  },
  {
    title: "ESSENTIAL / FUNCTIONAL STORAGE",
    content: [
      "Authentication and session: Relova uses Supabase Auth. In the current web app, the auth session is persisted in localStorage (not an HTTP cookie) so you stay signed in across visits.",
      "Theme preference: your light/dark theme choice is stored in localStorage under the key relova-theme.",
      "Product UI state: some in-app preferences (for example guest chat question counts, and a dashboard sidebar open/closed cookie named sidebar:state) may be stored locally to keep the interface usable.",
      "These technologies are used to operate the Service. Disabling them may break sign-in or basic product behavior.",
    ],
  },
  {
    title: "ADVERTISING / MEASUREMENT — META PIXEL",
    content: [
      "We load the Meta (Facebook) Pixel on the site. Meta's scripts typically set or read advertising cookies such as _fbp and, when present, _fbc. These support ad measurement, attribution, and matching with Meta Conversions API events we send from our servers.",
      "This means advertising/measurement cookies are used on Relova, contrary to older wording that may appear elsewhere on the site until that wording is fully updated.",
    ],
  },
  {
    title: "ANALYTICS",
    content: [
      "We do not currently load Google Analytics (or a Google Analytics measurement ID) on relova.ai. We do use Facebook domain verification meta tags related to Meta business setup.",
      "Third-party payment checkout (Paddle) may set its own cookies when you open checkout; those are controlled by Paddle's policies.",
    ],
  },
  {
    title: "CONSENT BANNER",
    content: [
      "Relova does not currently display a cookie consent banner or preference center. Cookies and similar technologies described above may run when you visit the site. If you want to limit tracking, you can use browser controls, private browsing, or Meta/ad platform opt-outs where available.",
    ],
  },
  {
    title: "MANAGING COOKIES",
    content: [
      "You can delete or block cookies through your browser settings. Blocking all cookies or clearing localStorage may sign you out or reset preferences.",
      "For privacy questions or data requests, contact support@relova.ai.",
    ],
  },
  {
    title: "CHANGES",
    content: [
      "We may update this Cookie Policy as our product or tracking setup changes. Material updates will be reflected on this page with a revised effective date.",
    ],
  },
];

export default function CookiePolicy() {
  return (
    <>
      <SEO
        title="Cookie Policy — Relova"
        description="How Relova uses cookies and similar technologies, including auth storage, theme preferences, and Meta Pixel advertising cookies."
        canonical="https://relova.ai/cookie-policy"
      />
      <LegalPage title="Cookie Policy" effectiveDate="August 5, 2026" sections={sections} />
    </>
  );
}
