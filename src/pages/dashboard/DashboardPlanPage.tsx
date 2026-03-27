import DashboardPlan from "@/components/dashboard/DashboardPlan";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function DashboardPlanPage() {
  const { profile, onNavigate } = useDashboardContext();
  return <DashboardPlan profile={profile} onBack={() => onNavigate("overview")} onNavigate={onNavigate} />;
}
