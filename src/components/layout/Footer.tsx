import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#" },
      { label: "Countries", href: "/dashboard" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Help center", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/30">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="text-[15px] font-bold tracking-[-0.04em] mb-3">relova</p>
            <p className="text-[13px] text-muted-foreground/50 leading-relaxed max-w-[220px]">
              Relocation, structured.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="text-[12px] font-medium mb-4 text-muted-foreground/50 uppercase tracking-[0.1em]">{group.title}</p>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-[13px] text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-6 border-t border-border/20">
          <p className="text-[11px] text-muted-foreground/30">© 2026 Relova. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
