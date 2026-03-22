import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, ListChecks, CheckSquare, MessageCircle, FileText, LogOut, Lock, ArrowLeft, User } from "lucide-react";
import RelovaLogo from "@/components/RelovaLogo";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardTab, UserPlan } from "@/pages/Dashboard";

const navItems: { id: DashboardTab; label: string; icon: typeof LayoutGrid; minPlan: UserPlan }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid, minPlan: "free" },
  { id: "plan", label: "My Plan", icon: ListChecks, minPlan: "full" },
  { id: "checklist", label: "Checklist", icon: CheckSquare, minPlan: "pro" },
  { id: "chat", label: "AI Chat", icon: MessageCircle, minPlan: "free" },
  { id: "documents", label: "Documents", icon: FileText, minPlan: "full" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                    : "text-[#9CA3AF] hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <item.icon size={16} />
                {item.label}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/[0.06] z-40 flex justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = activeTab === item.id;
          const locked = isLocked(item.minPlan);
          return (
            <button
              key={item.id}
              onClick={() => !locked && onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                locked ? "text-[#9CA3AF]/20" : active ? "text-[#38BDF8]" : "text-[#9CA3AF]"
              }`}
            >
              {locked ? <Lock size={18} /> : <item.icon size={18} />}
            </button>
          );
        })}
        {/* Profile / more menu */}
        <div className="relative">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[#9CA3AF] transition-colors"
          >
            <User size={18} />
          </button>
          {mobileMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-40 bg-[#141414] border border-white/[0.08] rounded-lg shadow-lg overflow-hidden">
              {onEditProfile && (
                <button
                  onClick={() => { onEditProfile(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-[#9CA3AF] hover:bg-white/[0.04] hover:text-foreground transition-colors"
                >
                  Edit profile
                </button>
              )}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-[13px] text-[#9CA3AF] hover:bg-white/[0.04] hover:text-foreground transition-colors"
              >
                ← Back to site
              </Link>
              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-[#9CA3AF] hover:bg-white/[0.04] hover:text-foreground transition-colors border-t border-white/[0.06]"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
