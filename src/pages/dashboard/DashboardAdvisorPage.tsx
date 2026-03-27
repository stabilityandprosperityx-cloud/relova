import DashboardChat from "@/components/dashboard/DashboardChat";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function DashboardAdvisorPage() {
  const { profile } = useDashboardContext();
  return <DashboardChat profile={profile} />;
}
