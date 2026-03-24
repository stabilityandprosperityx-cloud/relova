import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import type { UserProfile } from "@/pages/Dashboard";

interface DocWithStatus {
  id: string;
  document_name: string;
  is_required: boolean;
  description: string | null;
  status: "required" | "uploaded" | "optional";
}

interface Props {
  profile: UserProfile | null;
}

export default function DashboardChecklist({ profile }: Props) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const isPro = (profile?.plan || "free") === "pro";
  const isViewOnly = isPro; // pro can view but not toggle

  const fetchDocs = async () => {
    if (!user || !profile?.visa_type) { setLoading(false); return; }

    const { data: visaDocs } = await supabase
      .from("visa_documents")
      .select("*")
      .eq("visa_type", profile.visa_type!);

    const { data: userDocs } = await supabase
      .from("user_documents")
      .select("document_name, status")
      .eq("user_id", user.id);

    const uploadedSet = new Set((userDocs || []).filter((d: any) => d.status === "uploaded" || d.status === "verified").map((d: any) => d.document_name));

    const merged: DocWithStatus[] = (visaDocs || []).map((d: any) => ({
      ...d,
      status: uploadedSet.has(d.document_name) ? "uploaded" : d.is_required ? "required" : "optional",
    }));
    setDocs(merged);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [user, profile]);

  const toggleDoc = async (doc: DocWithStatus) => {
    if (!user || isViewOnly) return;
    if (doc.status === "uploaded") {
      await supabase.from("user_documents").delete().eq("user_id", user.id).eq("document_name", doc.document_name);
    } else {
      await supabase.from("user_documents").insert({ user_id: user.id, document_name: doc.document_name, status: "uploaded" });
    }
    fetchDocs();
  };

  if (!profile?.visa_type) {
    return <p className="text-[#9CA3AF] text-sm">Complete onboarding to see your checklist.</p>;
  }

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>;
  }

  const allRequiredDone = docs.filter(d => d.is_required).every(d => d.status === "uploaded");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Document checklist</h1>
        {profile.visa_type && profile.visa_type !== "TBD" && (
          <span className="px-2.5 py-1 rounded-md bg-[#38BDF8]/10 text-[#38BDF8] text-[11px] font-medium">
            {profile.visa_type.replace(/_/g, " ")} Visa
          </span>
        )}
        {profile.target_country && (
          <span className="px-2.5 py-1 rounded-md bg-white/[0.06] text-[#9CA3AF] text-[11px] font-medium">
            📍 {profile.target_country}
          </span>
        )}
        {isViewOnly && (
          <span className="px-2.5 py-1 rounded-md bg-white/[0.06] text-[#9CA3AF] text-[11px]">
            View only · Upgrade to Full to manage
          </span>
        )}
      </div>

      {allRequiredDone && (
        <div className="rounded-xl border border-[#38BDF8]/20 bg-[#38BDF8]/5 p-4 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-[#38BDF8] shrink-0" />
          <p className="text-[13px] text-[#38BDF8]">All required documents ready — you can proceed to visa application</p>
        </div>
      )}

      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 md:gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors min-h-[56px]"
          >
            <button
              onClick={() => toggleDoc(doc)}
              className={`shrink-0 transition-transform ${isViewOnly ? "cursor-default" : "active:scale-[0.9]"}`}
              disabled={isViewOnly}
            >
              <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                doc.status === "uploaded"
                  ? "bg-[#38BDF8] border-[#38BDF8]"
                  : "border-[#9CA3AF]/30 bg-transparent"
              }`}>
                {doc.status === "uploaded" && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-[13px] font-medium ${doc.status === "uploaded" ? "line-through text-[#9CA3AF]" : ""}`}>
                {doc.document_name}
              </div>
              {doc.description && (
                <div className="text-[11px] text-[#9CA3AF] mt-0.5">{doc.description}</div>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
              doc.status === "uploaded"
                ? "bg-[#38BDF8]/10 text-[#38BDF8]"
                : doc.is_required
                ? "bg-red-500/10 text-red-400"
                : "bg-white/[0.06] text-[#9CA3AF]"
            }`}>
              {doc.status === "uploaded" ? "Uploaded" : doc.is_required ? "Required" : "Optional"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
