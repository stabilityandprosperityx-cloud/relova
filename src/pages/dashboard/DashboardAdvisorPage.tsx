import DashboardChat from "@/components/dashboard/DashboardChat";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function DashboardAdvisorPage() {
  const { profile, relocationCase, onNavigate } = useDashboardContext();
  return <DashboardChat profile={profile} relocationCase={relocationCase} onNavigate={onNavigate} />;
}
