import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";
import RelovaLogo from "@/components/RelovaLogo";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

const navLinks = [
  { label: "Features",   href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Countries",  href: "/countries" },
  { label: "Pricing",    href: "/pricing" },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const { user, signOut } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove("dark");
      localStorage.setItem("relova-theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("relova-theme", "dark");
      setIsDark(true);
    }
  };

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const isActive = (href: string) =>
    href.startsWith("/#")
      ? location.pathname === "/"
      : location.pathname === href;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-2xl">
        <div className="container max-w-6xl px-5 md:px-8 flex h-[60px] items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-foreground shrink-0">
            <RelovaLogo size={20} pulse={false} className="text-foreground" />
            <span className="text-[14px] font-bold tracking-[-0.03em] uppercase">Relova</span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-3.5 py-1.5 text-[13px] rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-secondary text-muted-foreground"
              aria-label="Toggle theme"
            >
              {isDark
                ? <Sun size={15} />
                : <Moon size={15} />}
            </button>

            {user ? (
              <>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut size={13} strokeWidth={2} />
                  Log out
                </button>
                <Link to="/dashboard">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-[10px] px-4 h-9 text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ background: "hsl(var(--primary))" }}
                  >
                    Dashboard →
                  </button>
                </Link>
              </>
            ) : (
              <>
                <button
                  className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-2"
                  onClick={() => openAuth("login")}
                >
                  Log in
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-[10px] px-4 h-9 text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "hsl(var(--primary))" }}
                  onClick={() => openAuth("signup")}
                >
                  Get started →
                </button>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-1.5 text-muted-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-2xl px-5 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className={`block py-2 text-[14px] transition-colors ${
                  isActive(link.href)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border/30 mt-3 space-y-3">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                {isDark ? "Light mode" : "Dark mode"}
              </button>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block text-[14px] font-medium"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    Dashboard →
                  </Link>
                  <button
                    onClick={() => { signOut(); setOpen(false); }}
                    className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
                  >
                    <LogOut size={13} /> Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="block text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => { openAuth("login"); setOpen(false); }}
                  >
                    Log in
                  </button>
                  <button
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 h-10 text-[14px] font-semibold text-white"
                    style={{ background: "hsl(var(--primary))" }}
                    onClick={() => { openAuth("signup"); setOpen(false); }}
                  >
                    Get started →
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        title={authMode === "login" ? "Welcome back" : "Create your account"}
        subtitle={
          authMode === "login"
            ? "Log in to continue your relocation plan"
            : "Sign up to get personalized relocation guidance"
        }
      />
    </>
  );
}
