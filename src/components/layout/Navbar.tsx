import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import RelovaLogo from "@/components/RelovaLogo";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Countries", href: "/dashboard" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-2xl">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="text-[15px] font-bold tracking-[-0.04em] text-foreground">
          relova
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-[13px] transition-colors ${
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-5">
          <button className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Login
          </button>
          <Link to="/chat">
            <Button size="sm" className="h-8 text-[13px] px-5 rounded-lg font-medium">
              Get early access
            </Button>
          </Link>
        </div>

        <button className="md:hidden p-1.5 text-muted-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/30 bg-background p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border/30 mt-3 space-y-2">
            <button className="block text-sm text-muted-foreground">Login</button>
            <Link to="/chat" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full h-8 text-[13px]">Get early access</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
