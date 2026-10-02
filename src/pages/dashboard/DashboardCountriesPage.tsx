import DashboardCountries from "@/components/dashboard/DashboardCountries";
import { useDashboardContext } from "@/hooks/useDashboardContext";
import { Helmet } from "react-helmet-async";

export default function DashboardCountriesPage() {
  const { profile, onNavigate } = useDashboardContext();
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="relova-dashboard-section"><DashboardCountries profile={profile} onNavigate={onNavigate} /></div>
    </>
  );
}
