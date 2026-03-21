import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Countries", href: "/countries" },
  { label: "AI Chat", href: "/chat" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">R</span>
          </div>
          RelocateAI
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={location.pathname === link.href ? "text-foreground" : "text-muted-foreground"}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Log in
          </Button>
          <Button size="sm">Get Started</Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-muted-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                {link.label}
              </Button>
            </Link>
          ))}
          <div className="pt-2 border-t border-border space-y-2">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">Log in</Button>
            <Button className="w-full">Get Started</Button>
          </div>
        </div>
      )}
    </nav>
  );
}
