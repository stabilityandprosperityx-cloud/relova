import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/pages/Dashboard";

export function useDashboardProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user) { setProfileLoading(false); return; }
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

  return { user, authLoading, profile, setProfile, profileLoading, showOnboarding, setShowOnboarding };
}
