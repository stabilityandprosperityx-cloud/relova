import { useOutletContext } from "react-router-dom";
import type { UserProfile, DashboardTab } from "@/pages/Dashboard";

interface DashboardContext {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  onEditProfile: () => void;
  onNavigate: (tab: DashboardTab) => void;
}

export function useDashboardContext() {
  return useOutletContext<DashboardContext>();
}
