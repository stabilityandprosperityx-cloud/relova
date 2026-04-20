import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { Helmet } from "react-helmet-async";

export default function DashboardOverviewPage() {
  const { profile, onNavigate, onEditProfile, relocationCase } = useDashboardContext();
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <DashboardOverview profile={profile} onNavigate={onNavigate} onEditProfile={onEditProfile} relocationCase={relocationCase} />
    </>
  );
}
