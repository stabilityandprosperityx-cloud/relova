import DashboardPlan from "@/components/dashboard/DashboardPlan";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { Helmet } from "react-helmet-async";

export default function DashboardPlanPage() {
  const { profile, onNavigate, relocationCase } = useDashboardContext();
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <DashboardPlan
        profile={profile}
        onBack={() => onNavigate("overview")}
        onNavigate={onNavigate}
        relocationCase={relocationCase}
      />
    </>
  );
}
