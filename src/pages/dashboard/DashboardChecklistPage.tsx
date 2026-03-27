import DashboardChecklist from "@/components/dashboard/DashboardChecklist";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function DashboardChecklistPage() {
  const { profile } = useDashboardContext();
  return <DashboardChecklist profile={profile} />;
}
