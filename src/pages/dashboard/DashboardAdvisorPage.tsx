import DashboardChat from "@/components/dashboard/DashboardChat";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function DashboardAdvisorPage() {
  const { profile, relocationCase } = useDashboardContext();
  return <DashboardChat profile={profile} relocationCase={relocationCase} />;
}
