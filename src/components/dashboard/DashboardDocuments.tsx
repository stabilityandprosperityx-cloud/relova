import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Image, File } from "lucide-react";
import { toast } from "sonner";
import LockedOverlay from "./LockedOverlay";
import type { UserPlan } from "@/pages/Dashboard";

interface UserDoc {
  id: string;
  document_name: string;
  status: string;
  file_url: string | null;
  uploaded_at: string;
}

interface Props {
  userPlan: UserPlan;
}

export default function DashboardDocuments({ userPlan }: Props) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLocked = userPlan !== "full";

  const fetchDocs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });
    setDocs((data || []) as UserDoc[]);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || isLocked) return;

    setUploading(true);
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("user-documents")
      .upload(path, file);

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("user-documents").getPublicUrl(path);

    await supabase.from("user_documents").insert({
      user_id: user.id,
      document_name: file.name,
      status: "pending",
      file_url: urlData.publicUrl,
    });

    setTimeout(async () => {
      await supabase.from("user_documents").update({ status: "uploaded" }).eq("user_id", user.id).eq("document_name", file.name);
      fetchDocs();
    }, 2000);

    toast.success("Document uploaded");
    setUploading(false);
    fetchDocs();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const deleteDoc = async (doc: UserDoc) => {
    if (!user) return;
    if (doc.file_url) {
      const pathMatch = doc.file_url.match(/user-documents\/(.+)$/);
      if (pathMatch) {
        await supabase.storage.from("user-documents").remove([pathMatch[1]]);
      }
    }
    await supabase.from("user_documents").delete().eq("id", doc.id);
    toast.success("Document deleted");
    fetchDocs();
  };

  const getFileExt = (name: string) => (name.split(".").pop() || "FILE").toUpperCase();

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>;
  }

  return (
    <div className="space-y-6 relative">
      {isLocked && <LockedOverlay planRequired="full" />}
      <div className={isLocked ? "pointer-events-none" : ""}>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isLocked}
          className="w-full rounded-xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-8 text-center cursor-pointer mt-6"
        >
          <Upload size={24} className="mx-auto text-[#9CA3AF]/40 mb-3" />
          <p className="text-[13px] font-medium text-foreground">
            {uploading ? "Uploading..." : "Upload a document"}
          </p>
          <p className="text-[11px] text-[#9CA3AF] mt-1">PDF, JPG, PNG · AI will verify it meets your visa requirements</p>
        </button>
        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} className="hidden" />

        {docs.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF] text-center py-8">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-1 mt-6">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <span className="px-2 py-1 rounded bg-white/[0.06] text-[10px] font-medium text-[#38BDF8]">
                  {getFileExt(doc.document_name)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{doc.document_name}</div>
                  <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                  doc.status === "verified" || doc.status === "uploaded"
                    ? "bg-[#38BDF8]/10 text-[#38BDF8]"
                    : doc.status === "pending"
                    ? "bg-white/[0.06] text-[#9CA3AF]"
                    : "bg-amber-500/10 text-amber-400"
                }`}>
                  {doc.status === "verified" ? "Verified ✓" : doc.status === "uploaded" ? "Needs review" : "Pending"}
                </span>
                <button onClick={() => deleteDoc(doc)} className="text-[#9CA3AF]/40 hover:text-red-400 transition-colors shrink-0">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
