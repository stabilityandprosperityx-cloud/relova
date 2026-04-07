import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, ListChecks, CheckSquare, MessageCircle, FileText, LogOut, Lock, ArrowLeft, User, Sparkles, Globe } from "lucide-react";
import RelovaLogo from "@/components/RelovaLogo";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardTab, UserPlan } from "@/pages/Dashboard";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navItems: { id: DashboardTab; label: string; icon: typeof LayoutGrid; minPlan: UserPlan; highlight?: boolean }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid, minPlan: "free" },
  { id: "chat", label: "Your Advisor", icon: MessageCircle, minPlan: "free", highlight: true },
  { id: "plan", label: "Your Plan", icon: ListChecks, minPlan: "full" },
  { id: "checklist", label: "Checklist", icon: CheckSquare, minPlan: "pro" },
  { id: "documents", label: "Documents", icon: FileText, minPlan: "full" },
  { id: "countries", label: "Countries", icon: Globe, minPlan: "free" },
];

const planRank: Record<UserPlan, number> = { free: 0, pro: 1, full: 2 };

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

  const isLocked = (minPlan: UserPlan) => planRank[userPlan] < planRank[minPlan];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] flex-col bg-[#0a0a0a] border-r border-white/[0.06] z-40">
        <div className="px-5 py-6">
          <div className="flex items-center gap-2.5">
            <RelovaLogo size={22} pulse={false} />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">relova</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 mt-3 text-[11px] text-[#9CA3AF]/60 hover:text-[#9CA3AF] transition-colors"
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
                onClick={() => !locked && onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  locked
                    ? "text-[#9CA3AF]/30 cursor-not-allowed"
                    : active
                    ? "bg-[#38BDF820] text-[#38BDF8]"
                    : item.highlight
                    ? "text-[#38BDF8]/70 hover:text-[#38BDF8] hover:bg-[#38BDF8]/[0.06]"
                    : "text-[#9CA3AF] hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <item.icon size={16} />
                {item.label}
                {item.highlight && !active && !locked && (
                  <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#38BDF8]/10 text-[10px] text-[#38BDF8]/80 font-medium">
                    <Sparkles size={10} />
                    AI
                  </span>
                )}
                {locked && <Lock size={12} className="ml-auto text-[#9CA3AF]/30" />}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-2">
          {userPlan !== "full" && (
            <Link
              to="/pricing"
              className="block w-full text-center px-3 py-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] text-[11px] font-medium hover:bg-[#38BDF8]/20 transition-colors"
            >
              Upgrade plan ↑
            </Link>
          )}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[#9CA3AF] hover:text-foreground hover:bg-white/[0.04] transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
          <div className="px-3 py-2">
            <p className="text-[11px] text-[#9CA3AF]/60 truncate">{userEmail}</p>
            <p className="text-[10px] text-[#38BDF8]/60 capitalize mt-0.5">{userPlan} plan</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/[0.06] z-40 flex justify-around items-end px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const active = activeTab === item.id;
          const locked = isLocked(item.minPlan);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => !locked && onTabChange(item.id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 rounded-lg transition-colors ${
                locked ? "text-[#9CA3AF]/20" : active ? "text-[#38BDF8]" : "text-[#9CA3AF]"
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
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 rounded-lg text-[#9CA3AF] transition-colors hover:text-foreground"
            aria-label="Open account menu"
          >
            <User size={18} />
            <span className="text-[9px] font-medium leading-none opacity-80">Menu</span>
          </button>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl border-white/[0.08] bg-[#0a0a0a] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <SheetHeader className="space-y-1 text-left">
              <SheetTitle className="text-base text-foreground">Account</SheetTitle>
              <p className="truncate text-[12px] font-normal text-[#9CA3AF]">{userEmail}</p>
              <p className="text-[11px] capitalize text-[#38BDF8]/70">{userPlan} plan</p>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-0">
              {userPlan !== "full" && (
                <Link
                  to="/pricing"
                  onClick={() => setMobileSheetOpen(false)}
                  className="rounded-lg px-3 py-3 text-center text-[14px] font-medium text-[#38BDF8] transition-colors hover:bg-[#38BDF8]/10"
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
                  className="w-full rounded-lg px-3 py-3 text-left text-[14px] text-[#9CA3AF] transition-colors hover:bg-white/[0.04] hover:text-foreground"
                >
                  Edit profile
                </button>
              )}
              <Link
                to="/"
                onClick={() => setMobileSheetOpen(false)}
                className="rounded-lg px-3 py-3 text-[14px] text-[#9CA3AF] transition-colors hover:bg-white/[0.04] hover:text-foreground"
              >
                ← Back to site
              </Link>
              <button
                type="button"
                onClick={() => {
                  void signOut();
                  setMobileSheetOpen(false);
                }}
                className="mt-2 flex w-full items-center gap-2 border-t border-white/[0.08] px-3 py-4 text-left text-[14px] font-medium text-foreground transition-colors hover:bg-white/[0.04]"
              >
                <LogOut size={16} className="text-[#9CA3AF]" />
                Log out
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  );
}
