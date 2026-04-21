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


export type DashboardTab = "overview" | "plan" | "checklist" | "chat" | "documents" | "countries";

export type UserPlan = "free" | "pro" | "full";

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
  family_status?: string | null;
  timeline?: string | null;
  constraints?: string | null;
  match_score?: number | null;
  recommended_country?: string | null;
  move_date?: string | null;
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
  "/dashboard/checklist": "checklist",
  "/dashboard/documents": "documents",
  "/dashboard/countries": "countries",
};

const tabToRoute: Record<DashboardTab, string> = {
  overview: "/dashboard",
  chat: "/dashboard/advisor",
  plan: "/dashboard/plan",
  checklist: "/dashboard/checklist",
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
      if (data) {
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
      <div className="min-h-screen bg-[#0a0a0a] pt-20 md:pt-24 flex justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex">
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

      <main
        className="relative flex-1 md:ml-[220px] pb-24 md:pb-0"
        style={{ background: "#07090f" }}
      >
        <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
          {/* Grid */}
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />
          {/* Glow top-right */}
          <div
            style={{
              position: "absolute", top: -100, right: -100,
              width: 600, height: 400,
              background: "radial-gradient(ellipse, rgba(56,189,248,0.07) 0%, transparent 65%)",
            }}
          />
          {/* Glow bottom-left */}
          <div
            style={{
              position: "absolute", bottom: -100, left: 100,
              width: 500, height: 400,
              background: "radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 65%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-6 md:pb-8">
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
