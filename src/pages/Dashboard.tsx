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
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<DashboardTab>("overview");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
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
      />

      {/* Main content */}
      <main className="flex-1 md:ml-[220px] pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          {profileLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            </div>
          ) : (
            <>
              {tab === "overview" && <DashboardOverview profile={profile} onNavigate={setTab} />}
              {tab === "plan" && <DashboardPlan profile={profile} />}
              {tab === "checklist" && <DashboardChecklist profile={profile} />}
              {tab === "chat" && <DashboardChat profile={profile} />}
              {tab === "documents" && <DashboardDocuments userPlan={profile?.plan || "free"} />}
            </>
          )}
        </div>
      </main>

      {showOnboarding && user && (
        <OnboardingModal
          userId={user.id}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}
