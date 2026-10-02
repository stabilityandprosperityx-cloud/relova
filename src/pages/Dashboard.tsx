import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
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
  const relocationCase = useRelocationCase(profileLoading ? null : profile);

  const activeTab = routeToTab[location.pathname] || "overview";

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
                <Outlet context={{ profile, setProfile, onEditProfile: () => setShowEditProfile(true), onNavigate: handleTabChange, relocationCase }} />
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
