import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, ListChecks, MessageCircle, FileText, LogOut, Lock, ArrowLeft, User, Sparkles, Globe } from "lucide-react";
import RelovaLogo from "@/components/RelovaLogo";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardTab, UserPlan } from "@/pages/Dashboard";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import LockedOverlay from "./LockedOverlay";
import LockedOverlayPro from "./LockedOverlayPro";

const navItems: { id: DashboardTab; label: string; icon: typeof LayoutGrid; minPlan: UserPlan; highlight?: boolean }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid, minPlan: "free" },
  { id: "chat", label: "Your Advisor", icon: MessageCircle, minPlan: "free", highlight: true },
  { id: "plan", label: "Your Plan", icon: ListChecks, minPlan: "pro" },
  { id: "documents", label: "Documents", icon: FileText, minPlan: "full" },
  { id: "countries", label: "Countries", icon: Globe, minPlan: "free" },
];

const planRank: Record<UserPlan, number> = { free: 0, pro: 1, full: 2, concierge: 3 };

interface Props {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  userEmail: string;
  userPlan: UserPlan;
  onEditProfile?: () => void;
}

export default function DashboardSidebar({ activeTab, onTabChange, userEmail, userPlan, onEditProfile }: Props) {
  const { signOut } = useAuth();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [lockedModal, setLockedModal] = useState<"pro" | "full" | null>(null);

  const isLocked = (minPlan: UserPlan) => planRank[userPlan] < planRank[minPlan];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] flex-col bg-sidebar border-r border-sidebar-border z-40">
        <div className="px-5 py-6">
          <div className="flex items-center gap-2.5">
            <RelovaLogo size={22} pulse={false} />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">relova</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft size={12} />
            Back to site
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            const locked = isLocked(item.minPlan);
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (locked) {
                    setLockedModal(item.minPlan === "pro" ? "pro" : "full");
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  locked
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : active
                    ? "text-[#a78bfa] dark:text-[#c4b5fd]"
                    : item.highlight
                    ? "text-primary/70 hover:text-primary hover:bg-primary/[0.06]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                style={active ? { background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.07))" } : undefined}
              >
                {active && (
                  <div
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full"
                    style={{ background: "linear-gradient(180deg, #8b5cf6, #6366f1)" }}
                  />
                )}
                <item.icon size={16} />
                {item.label}
                {item.highlight && !active && !locked && (
                  <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-[10px] text-primary font-medium">
                    <Sparkles size={10} />
                    AI
                  </span>
                )}
                {locked && <Lock size={12} className="ml-auto text-muted-foreground/30" />}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-2">
          {userPlan !== "full" && userPlan !== "concierge" && (
            <Link
              to="/pricing"
              className="block w-full text-center px-3 py-2 rounded-lg text-[11px] font-medium text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 0 20px rgba(139,92,246,0.3)", border: "none" }}
            >
              Upgrade plan ↑
            </Link>
          )}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
          <div className="px-3 py-2">
            <p className="text-[11px] text-muted-foreground/60 truncate">{userEmail}</p>
            <p className="text-[10px] text-primary/60 capitalize mt-0.5">{userPlan} plan</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-40 flex justify-around items-end px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const active = activeTab === item.id;
          const locked = isLocked(item.minPlan);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (locked) {
                  setLockedModal(item.minPlan === "pro" ? "pro" : "full");
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 rounded-lg transition-colors ${
                locked ? "text-muted-foreground/20" : active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {locked ? <Lock size={18} /> : <item.icon size={18} />}
            </button>
          );
        })}
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <button
            type="button"
            onClick={() => setMobileSheetOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 rounded-lg text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Open account menu"
          >
            <User size={18} />
            <span className="text-[9px] font-medium leading-none opacity-80">Menu</span>
          </button>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl border-border bg-card pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <SheetHeader className="space-y-1 text-left">
              <SheetTitle className="text-base text-foreground">Account</SheetTitle>
              <p className="truncate text-[12px] font-normal text-muted-foreground">{userEmail}</p>
              <p className="text-[11px] capitalize text-primary/70">{userPlan} plan</p>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-0">
              {userPlan !== "full" && userPlan !== "concierge" && (
                <Link
                  to="/pricing"
                  onClick={() => setMobileSheetOpen(false)}
                  className="rounded-lg px-3 py-3 text-center text-[14px] font-medium text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 0 20px rgba(139,92,246,0.3)", border: "none" }}
                >
                  Upgrade plan
                </Link>
              )}
              {onEditProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onEditProfile();
                    setMobileSheetOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-3 text-left text-[14px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Edit profile
                </button>
              )}
              <Link
                to="/"
                onClick={() => setMobileSheetOpen(false)}
                className="rounded-lg px-3 py-3 text-[14px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                ← Back to site
              </Link>
              <button
                type="button"
                onClick={() => {
                  void signOut();
                  setMobileSheetOpen(false);
                }}
                className="mt-2 flex w-full items-center gap-2 border-t border-white/[0.08] px-3 py-4 text-left text-[14px] font-medium text-foreground transition-colors hover:bg-muted"
              >
                <LogOut size={16} className="text-muted-foreground" />
                Log out
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
      {lockedModal === "pro" && <LockedOverlayPro onClose={() => setLockedModal(null)} />}
      {lockedModal === "full" && <LockedOverlay onClose={() => setLockedModal(null)} />}
    </>
  );
}
