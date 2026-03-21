import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "AI Assistant", href: "/chat" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Countries",
    links: [
      { label: "Portugal", href: "/countries/portugal" },
      { label: "UAE", href: "/countries/uae" },
      { label: "Georgia", href: "/countries/georgia" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-semibold text-lg mb-3">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">R</span>
              </div>
              RelocateAI
            </div>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Your AI-powered relocation partner. Move anywhere with confidence.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-medium mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 RelocateAI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
