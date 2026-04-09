import DashboardChecklist from "@/components/dashboard/DashboardChecklist";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function DashboardChecklistPage() {
  const { profile, relocationCase } = useDashboardContext();
  return <DashboardChecklist profile={profile} relocationCase={relocationCase} />;
}
