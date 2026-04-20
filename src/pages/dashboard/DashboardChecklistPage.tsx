import DashboardChecklist from "@/components/dashboard/DashboardChecklist";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { Helmet } from "react-helmet-async";

export default function DashboardChecklistPage() {
  const { profile, relocationCase } = useDashboardContext();
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <DashboardChecklist profile={profile} relocationCase={relocationCase} />
    </>
  );
}
