import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, ListChecks, MessageCircle, FileText, LogOut, Lock, ArrowLeft, User, Globe2, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardTab, UserPlan } from "@/pages/Dashboard";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import LockedOverlay from "./LockedOverlay";
import LockedOverlayPro from "./LockedOverlayPro";

const navItems: { id: DashboardTab; label: string; icon: typeof LayoutGrid; minPlan: UserPlan }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid, minPlan: "free" },
  { id: "chat", label: "Your Advisor", icon: MessageCircle, minPlan: "free" },
  { id: "plan", label: "Your Plan", icon: ListChecks, minPlan: "pro" },
  { id: "documents", label: "Documents", icon: FileText, minPlan: "full" },
  { id: "countries", label: "Countries", icon: Globe2, minPlan: "free" },
];
const planRank: Record<UserPlan, number> = { free: 0, pro: 1, full: 2, concierge: 3 };

interface Props { activeTab: DashboardTab; onTabChange: (tab: DashboardTab) => void; userEmail: string; userPlan: UserPlan; onEditProfile?: () => void; }

export default function DashboardSidebar({ activeTab, onTabChange, userEmail, userPlan, onEditProfile }: Props) {
  const { signOut } = useAuth();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [lockedModal, setLockedModal] = useState<"pro" | "full" | null>(null);
  const isLocked = (minimum: UserPlan) => planRank[userPlan] < planRank[minimum];
  const choose = (id: DashboardTab, minimum: UserPlan) => isLocked(minimum) ? setLockedModal(minimum === "pro" ? "pro" : "full") : onTabChange(id);

  return <>
    <aside className="relova-workspace-sidebar">
      <div className="relova-workspace-brand"><img src="/assets/relova-mark.png" alt=""/><span>RELOVA</span></div>
      <a href="/" className="relova-back-site"><ArrowLeft size={13}/> Back to site</a>
      <nav>{navItems.map(item => { const active=activeTab===item.id; const locked=isLocked(item.minPlan); return <button key={item.id} onClick={() => choose(item.id,item.minPlan)} className={active?"active":""}><item.icon size={17}/><span>{item.label}</span>{locked&&<Lock size={11}/>}</button>; })}</nav>
      <div className="relova-sidebar-bottom">
        {userPlan!=="full"&&userPlan!=="concierge"&&<Link to="/pricing" className="relova-upgrade"><Crown size={14}/> Upgrade plan</Link>}
        <button onClick={signOut}><LogOut size={16}/> Log out</button>
        <div className="relova-account"><span>{userEmail}</span><b>{userPlan} plan</b></div>
      </div>
    </aside>

    <nav className="relova-workspace-mobilebar">
      {navItems.map(item => { const locked=isLocked(item.minPlan); return <button key={item.id} onClick={() => choose(item.id,item.minPlan)} className={activeTab===item.id?"active":""}>{locked?<Lock size={18}/>:<item.icon size={19}/>}<span>{item.label.replace("Your ","")}</span></button>; })}
      <button onClick={() => setMobileSheetOpen(true)}><User size={19}/><span>Menu</span></button>
    </nav>

    <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}><SheetContent side="bottom" className="rounded-t-[28px] border-[#ded3df] bg-[#fbf7f3] pb-8"><SheetHeader><SheetTitle>Account</SheetTitle></SheetHeader><div className="mt-5 space-y-2"><p className="text-sm text-[#716674]">{userEmail}</p>{onEditProfile&&<button className="w-full rounded-xl bg-white p-4 text-left" onClick={()=>{onEditProfile();setMobileSheetOpen(false)}}>Edit relocation profile</button>}<button className="flex w-full items-center gap-2 rounded-xl bg-white p-4" onClick={signOut}><LogOut size={16}/> Log out</button></div></SheetContent></Sheet>
    {lockedModal==="pro"&&<LockedOverlayPro onClose={()=>setLockedModal(null)}/>} {lockedModal==="full"&&<LockedOverlay onClose={()=>setLockedModal(null)}/>} 
  </>;
}
