import { useNavigate } from "react-router-dom";
import type { DashboardTab } from "@/pages/Dashboard";

const tabToRoute: Record<DashboardTab, string> = {
  overview: "/dashboard",
  chat: "/dashboard/advisor",
  plan: "/dashboard/plan",
  checklist: "/dashboard/checklist",
  documents: "/dashboard/documents",
};

export function useDashboardNavigate() {
  const navigate = useNavigate();
  return (tab: DashboardTab) => navigate(tabToRoute[tab]);
}
