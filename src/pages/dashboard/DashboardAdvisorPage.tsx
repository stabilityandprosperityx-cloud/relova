import DashboardChat from "@/components/dashboard/DashboardChat";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { Helmet } from "react-helmet-async";

export default function DashboardAdvisorPage() {
  const { profile, relocationCase, onNavigate } = useDashboardContext();
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <DashboardChat profile={profile} relocationCase={relocationCase} onNavigate={onNavigate} />
    </>
  );
}
