import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import OnboardingModal from "@/components/dashboard/OnboardingModal";
import EditProfileModal from "@/components/dashboard/EditProfileModal";
import FeedbackWidget from "@/components/dashboard/FeedbackWidget";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useRelocationCase } from "@/hooks/useRelocationCase";
import { Helmet } from "react-helmet-async";
import type { RelocationCase } from "@/hooks/useRelocationCase";

const DashboardOverview = lazy(() => import("@/components/dashboard/DashboardOverview"));
const DashboardChat = lazy(() => import("@/components/dashboard/DashboardChat"));
const DashboardPlan = lazy(() => import("@/components/dashboard/DashboardPlan"));
const DashboardDocuments = lazy(() => import("@/components/dashboard/DashboardDocuments"));
const DashboardCountries = lazy(() => import("@/components/dashboard/DashboardCountries"));


export type DashboardTab = "overview" | "plan" | "chat" | "documents" | "countries";

export type UserPlan = "free" | "pro" | "full" | "concierge";

export interface UserProfile {
  user_id: string;
  citizenship: string | null;
  target_country: string | null;
  visa_type: string | null;
  goal: string | null;
  monthly_budget: number | null;
  plan: UserPlan;
  questions_used: number;
  plan_expires_at: string | null;
  documents_status?: "generating" | "ready" | "failed" | null;
  family_status?: string | null;
  timeline?: string | null;
  constraints?: string | null;
  match_score?: number | null;
  recommended_country?: string | null;
  move_date?: string | null;
  paddle_customer_id?: string | null;
  paddle_subscription_id?: string | null;
}

export interface DashboardOutletContext {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  onEditProfile: () => void;
  onNavigate: (tab: DashboardTab) => void;
  relocationCase: RelocationCase;
}

const routeToTab: Record<string, DashboardTab> = {
  "/dashboard": "overview",
  "/dashboard/advisor": "chat",
  "/dashboard/plan": "plan",
  "/dashboard/documents": "documents",
  "/dashboard/countries": "countries",
};

const tabToRoute: Record<DashboardTab, string> = {
  overview: "/dashboard",
  chat: "/dashboard/advisor",
  plan: "/dashboard/plan",
  documents: "/dashboard/documents",
  countries: "/dashboard/countries",
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [visitedTabs, setVisitedTabs] = useState<Set<DashboardTab>>(() => new Set(["overview"]));
  const relocationCase = useRelocationCase(profileLoading ? null : profile);

  const activeTab = routeToTab[location.pathname] || "overview";

  useEffect(() => {
    setVisitedTabs((current) => {
      if (current.has(activeTab)) return current;
      const next = new Set(current);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  const handleTabChange = (tab: DashboardTab) => {
    navigate(tabToRoute[tab]);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setProfileLoading(true);
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data && data.target_country) {
        setProfile(data as UserProfile);
      } else {
        setShowOnboarding(true);
      }
      setProfileLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setShowOnboarding(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background pt-20 md:pt-24 flex justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  return (
    <div className="relova-workspace-shell min-h-screen flex">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userEmail={user.email || ""}
        userPlan={profile?.plan || "free"}
        onEditProfile={() => setShowEditProfile(true)}
      />

      <main className="relova-workspace-main relative flex-1 pb-24 md:pb-0">
        <div className="relative z-10 mx-auto max-w-[1420px] px-4 pb-8 pt-4 md:px-8 md:pb-12 md:pt-8">
          {profileLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            </div>
          ) : (
            <div className="relova-dashboard-tabs">
              {visitedTabs.has("overview") && <section className={activeTab === "overview" ? "relova-dashboard-tab active" : "relova-dashboard-tab"} aria-hidden={activeTab !== "overview"}><Suspense fallback={<DashboardTabFallback />}><DashboardOverview profile={profile} onNavigate={handleTabChange} onEditProfile={() => setShowEditProfile(true)} relocationCase={relocationCase} /></Suspense></section>}
              {visitedTabs.has("chat") && <section className={activeTab === "chat" ? "relova-dashboard-tab active" : "relova-dashboard-tab"} aria-hidden={activeTab !== "chat"}><Suspense fallback={<DashboardTabFallback />}><div className="relova-dashboard-section relova-dashboard-advisor"><DashboardChat profile={profile} relocationCase={relocationCase} onNavigate={handleTabChange} /></div></Suspense></section>}
              {visitedTabs.has("plan") && <section className={activeTab === "plan" ? "relova-dashboard-tab active" : "relova-dashboard-tab"} aria-hidden={activeTab !== "plan"}><Suspense fallback={<DashboardTabFallback />}><div className="relova-dashboard-section"><DashboardPlan profile={profile} onBack={() => handleTabChange("overview")} onNavigate={handleTabChange} relocationCase={relocationCase} /></div></Suspense></section>}
              {visitedTabs.has("documents") && <section className={activeTab === "documents" ? "relova-dashboard-tab active" : "relova-dashboard-tab"} aria-hidden={activeTab !== "documents"}><Suspense fallback={<DashboardTabFallback />}><div className="relova-dashboard-section"><DashboardDocuments profile={profile} onBack={() => handleTabChange("overview")} onNavigate={handleTabChange} relocationCase={relocationCase} /></div></Suspense></section>}
              {visitedTabs.has("countries") && <section className={activeTab === "countries" ? "relova-dashboard-tab active" : "relova-dashboard-tab"} aria-hidden={activeTab !== "countries"}><Suspense fallback={<DashboardTabFallback />}><div className="relova-dashboard-section"><DashboardCountries profile={profile} onNavigate={handleTabChange} /></div></Suspense></section>}
            </div>
          )}
        </div>
      </main>

      {showOnboarding && user && (
        <OnboardingModal userId={user.id} onComplete={handleOnboardingComplete} />
      )}

      {showEditProfile && profile && (
        <EditProfileModal
          profile={profile}
          onSave={(updated) => { setProfile(updated); setShowEditProfile(false); }}
          onClose={() => setShowEditProfile(false)}
        />
      )}
      <FeedbackWidget />
    </div>
  );
}

function DashboardTabFallback() {
  return <div className="relova-dashboard-tab-loading"><span /><span /><span /></div>;
}
