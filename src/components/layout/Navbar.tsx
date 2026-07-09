import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";
import RelovaLogo from "@/components/RelovaLogo";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Countries", href: "/countries" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const { user, signOut } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('relova-theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('relova-theme', 'dark');
      setIsDark(true);
    }
  };

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-2xl">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-foreground">
            <RelovaLogo size={22} />
            <span className="text-[15px] font-bold tracking-[-0.04em]">relova</span>
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
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-muted"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} className="text-muted-foreground" /> : <Moon size={16} className="text-muted-foreground" />}
            </button>
            {user ? (
              <>
                <button
                  onClick={signOut}
                  className="text-[13px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <LogOut size={13} /> Log out
                </button>
                <Link to="/dashboard">
                  <Button
                    size="sm"
                    className="inline-flex items-center gap-1.5 rounded-[8px] px-4 h-9 text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 0 24px rgba(139,92,246,0.3)", border: "none" }}
                  >
                    Dashboard →
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <button
                  className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => openAuth("login")}
                >
                  Login
                </button>
                <Button
                  size="sm"
                  className="h-8 text-[13px] px-5 rounded-lg font-medium"
                  onClick={() => openAuth("signup")}
                >
                  Sign up
                </Button>
              </>
            )}
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
              <button
                onClick={toggleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-muted"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={16} className="text-muted-foreground" /> : <Moon size={16} className="text-muted-foreground" />}
              </button>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block py-2 text-sm font-medium text-[hsl(199,89%,61%)]"
                  >
                    Dashboard →
                  </Link>
                  <button onClick={() => { signOut(); setOpen(false); }} className="block py-2 text-sm text-muted-foreground">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button className="block text-sm text-muted-foreground" onClick={() => openAuth("login")}>
                    Login
                  </button>
                  <Button size="sm" className="w-full h-8 text-[13px]" onClick={() => openAuth("signup")}>
                    Sign up
                  </Button>
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
