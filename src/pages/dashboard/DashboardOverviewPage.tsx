import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function DashboardOverviewPage() {
  const { profile, onNavigate, onEditProfile, relocationCase } = useDashboardContext();
  return <DashboardOverview profile={profile} onNavigate={onNavigate} onEditProfile={onEditProfile} relocationCase={relocationCase} />;
}
