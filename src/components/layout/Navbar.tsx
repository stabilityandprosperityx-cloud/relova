import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Countries", href: "/countries" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const isActive = (href: string) => href.startsWith("/#")
    ? location.pathname === "/"
    : location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <header className="relova-site-header">
      <div className="relova-header-inner">
        <Link to="/" className="relova-header-brand" aria-label="Relova home">
          <img src="/assets/relova-mark.png" alt="" width="30" height="30" />
          <span>RELOVA</span>
        </Link>
        <nav className="relova-header-nav" aria-label="Main navigation">
          {navLinks.map((link) => <a key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined}>{link.label}</a>)}
        </nav>
        <div className="relova-header-actions">
          {user ? <><button type="button" className="relova-header-login" onClick={signOut}><LogOut size={14}/> Log out</button><Link className="relova-header-cta" to="/dashboard">Dashboard</Link></>
            : <><Link className="relova-header-login" to="/login">Log in</Link><Link className="relova-header-cta" to="/signup">Get started</Link></>}
        </div>
        <button type="button" className="relova-header-toggle" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>{open ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
      {open && <div className="relova-header-mobile">
        {navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={isActive(link.href) ? "page" : undefined}>{link.label}</a>)}
        <div>{user ? <><Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link><button type="button" onClick={() => { signOut(); setOpen(false); }}>Log out</button></>
          : <><Link to="/login" onClick={() => setOpen(false)}>Log in</Link><Link className="relova-header-cta" to="/signup" onClick={() => setOpen(false)}>Get started</Link></>}</div>
      </div>}
    </header>
  );
}
