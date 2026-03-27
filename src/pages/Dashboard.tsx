import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DashboardPlan from "@/components/dashboard/DashboardPlan";
import DashboardChecklist from "@/components/dashboard/DashboardChecklist";
import DashboardChat from "@/components/dashboard/DashboardChat";
import DashboardDocuments from "@/components/dashboard/DashboardDocuments";
import OnboardingModal from "@/components/dashboard/OnboardingModal";
import EditProfileModal from "@/components/dashboard/EditProfileModal";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export type DashboardTab = "overview" | "plan" | "checklist" | "chat" | "documents";

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
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<DashboardTab>("overview");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

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
      <DashboardSidebar
        activeTab={tab}
        onTabChange={setTab}
        userEmail={user.email || ""}
        userPlan={profile?.plan || "free"}
        onEditProfile={() => setShowEditProfile(true)}
      />

      <main className="flex-1 md:ml-[220px] pb-24 md:pb-0">
        <div className="max-w-5xl mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-6 md:pb-8">
          {profileLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            </div>
          ) : (
            <>
              {tab === "overview" && <DashboardOverview profile={profile} onNavigate={setTab} onEditProfile={() => setShowEditProfile(true)} />}
              {tab === "plan" && <DashboardPlan profile={profile} onBack={() => setTab("overview")} />}
              {tab === "checklist" && <DashboardChecklist profile={profile} />}
              {tab === "chat" && <DashboardChat profile={profile} />}
              {tab === "documents" && <DashboardDocuments userPlan={profile?.plan || "free"} onBack={() => setTab("overview")} />}
            </>
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
    </div>
  );
}
