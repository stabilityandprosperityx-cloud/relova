import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Concierge", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Mission", href: "/mission" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Country Guides", href: "/countries" },
      { label: "Visa Eligibility Check", href: "/tools/can-i-move" },
      { label: "Where Should I Move?", href: "/tools/where-should-i-move" },
      { label: "Document Checklist", href: "/tools/documents-needed" },
      { label: "Country Compare", href: "/tools/country-compare" },
      { label: "Invitation Letter", href: "/tools/invitation-letter" },
      { label: "Tax Residency Tracker", href: "/tools/tax-residency-tracker" },
      { label: "Data & Sources", href: "/data-sources" },
      { label: "Relocation Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Data Security", href: "/data-security" },
      { label: "Compliance", href: "/compliance" },
    ],
  },
];

const SOCIALS = [
  {
    label: "X (Twitter)",
    href: "https://x.com/relovaai?s=21",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/relova.ai?igsh=M3pybzQ2NGl4dTM2",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1L86TEQgJz/?mibextid=wwXIfr",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCfMlZu3QynIY7y9B4qoE15g",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container max-w-6xl px-5 md:px-8 py-14">

        {/* Main grid: logo col + 4 link cols + newsletter col */}
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1.3fr] gap-8 mb-12">

          {/* Logo + description + socials */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(var(--primary))" }}
              >
                <span className="text-[10px] font-bold text-white">R</span>
              </div>
              <span className="text-[15px] font-bold tracking-[-0.02em] text-foreground">RELOVA</span>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[200px] mb-5">
              Relova is your all-in-one relocation partner. Trusted by thousands of people and families to plan, move, and thrive in a new country.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/60 mb-4">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/60 mb-4">
              Stay in the know
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
              Get tips, guides, and updates to your inbox.
            </p>
            <div className="flex items-center gap-0 rounded-xl border border-border bg-card overflow-hidden focus-within:border-primary/40 transition-colors">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 h-10 px-3 text-[13px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50 min-w-0"
              />
              <button
                className="h-10 w-10 flex items-center justify-center flex-shrink-0 transition-colors hover:opacity-80"
                style={{ background: "hsl(var(--primary))" }}
                aria-label="Subscribe"
              >
                <ArrowRight size={14} className="text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-[11px] text-muted-foreground/40">
            © 2026 Relova, Inc. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
