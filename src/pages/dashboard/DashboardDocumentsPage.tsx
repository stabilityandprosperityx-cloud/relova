import DashboardDocuments from "@/components/dashboard/DashboardDocuments";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function DashboardDocumentsPage() {
  const { profile, onNavigate, relocationCase } = useDashboardContext();
  return <DashboardDocuments profile={profile} onBack={() => onNavigate("overview")} onNavigate={onNavigate} relocationCase={relocationCase} />;
}
