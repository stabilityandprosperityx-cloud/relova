import DashboardDocuments from "@/components/dashboard/DashboardDocuments";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { Helmet } from "react-helmet-async";

export default function DashboardDocumentsPage() {
  const { profile, onNavigate, relocationCase } = useDashboardContext();
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <DashboardDocuments profile={profile} onBack={() => onNavigate("overview")} onNavigate={onNavigate} relocationCase={relocationCase} />
    </>
  );
}
