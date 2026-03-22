import { LayoutGrid, ListChecks, CheckSquare, MessageCircle, FileText, LogOut } from "lucide-react";
import RelovaLogo from "@/components/RelovaLogo";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardTab } from "@/pages/Dashboard";

const navItems: { id: DashboardTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "plan", label: "My Plan", icon: ListChecks },
  { id: "checklist", label: "Checklist", icon: CheckSquare },
  { id: "chat", label: "AI Chat", icon: MessageCircle },
  { id: "documents", label: "Documents", icon: FileText },
];

interface Props {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  userEmail: string;
}

export default function DashboardSidebar({ activeTab, onTabChange, userEmail }: Props) {
  const { signOut } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] flex-col bg-[#0a0a0a] border-r border-white/[0.06] z-40">
        <div className="px-5 py-6 flex items-center gap-2.5">
          <RelovaLogo size={22} pulse={false} />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">relova</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-[#38BDF820] text-[#38BDF8]"
                    : "text-[#9CA3AF] hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-2">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[#9CA3AF] hover:text-foreground hover:bg-white/[0.04] transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
          <div className="px-3 py-2">
            <p className="text-[11px] text-[#9CA3AF]/60 truncate">{userEmail}</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/[0.06] z-40 flex justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                active ? "text-[#38BDF8]" : "text-[#9CA3AF]"
              }`}
            >
              <item.icon size={18} />
            </button>
          );
        })}
      </nav>
    </>
  );
}
