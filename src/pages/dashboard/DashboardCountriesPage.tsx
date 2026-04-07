import DashboardCountries from "@/components/dashboard/DashboardCountries";
import { useDashboardContext } from "@/hooks/useDashboardContext";

export default function DashboardCountriesPage() {
  const { profile, onNavigate } = useDashboardContext();
  return <DashboardCountries profile={profile} onNavigate={onNavigate} />;
}
