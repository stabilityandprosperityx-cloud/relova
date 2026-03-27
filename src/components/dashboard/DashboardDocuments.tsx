import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, CheckCircle2, AlertCircle, Clock, FileText, Sparkles, ChevronDown, Link2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import LockedOverlay from "./LockedOverlay";
import type { UserProfile } from "@/pages/Dashboard";

interface UserDoc {
  id: string;
  document_name: string;
  status: string;
  file_url: string | null;
  uploaded_at: string;
}

interface RequiredDoc {
  id: string;
  document_name: string;
  description: string | null;
  is_required: boolean;
  category: string;
  uploadedDoc: UserDoc | null;
  aiStatus: string | null;
  usedFor: string;
}

interface Props {
  profile: UserProfile | null;
  onBack?: () => void;
}

const CATEGORIES = [
  { key: "identity", label: "Identity", description: "Personal identification documents" },
  { key: "financial", label: "Financial proof", description: "Income and financial documentation" },
  { key: "legal", label: "Legal documents", description: "Permits, certificates, and legal paperwork" },
];

function categorizeDoc(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("passport") || lower.includes("id") || lower.includes("photo") || lower.includes("birth"))
    return "identity";
  if (lower.includes("bank") || lower.includes("income") || lower.includes("tax") || lower.includes("financial") || lower.includes("budget") || lower.includes("statement"))
    return "financial";
  return "legal";
}

function getUsedFor(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("passport")) return "Visa application, residence permit";
  if (lower.includes("photo")) return "Visa application, ID card";
  if (lower.includes("bank") || lower.includes("statement")) return "Proof of funds, visa application";
  if (lower.includes("income") || lower.includes("tax")) return "Residence permit, tax registration";
  if (lower.includes("insurance")) return "Visa application, residence permit";
  if (lower.includes("criminal") || lower.includes("background")) return "Residence permit application";
  if (lower.includes("marriage")) return "Family visa, dependent permit";
  if (lower.includes("birth")) return "Family visa, citizenship application";
  if (lower.includes("cv") || lower.includes("resume")) return "Work permit application";
  if (lower.includes("accommodation") || lower.includes("rental")) return "Address registration, visa";
  if (lower.includes("nif") || lower.includes("nie") || lower.includes("emirates")) return "Tax registration, residence";
  return "Relocation process";
}

function getAiStatus(doc: UserDoc | null): string | null {
  if (!doc) return null;
  if (doc.status === "verified") return "Looks valid";
  if (doc.status === "pending") return "Analyzing...";
  if (doc.status === "uploaded") return "Needs review";
  return "Needs attention";
}

function getRelatedTask(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes("passport") || lower.includes("photo") || lower.includes("copy"))
    return "Prepare travel documents";
  if (lower.includes("bank") || lower.includes("financial") || lower.includes("statement"))
    return "Set up finances";
  if (lower.includes("insurance"))
    return "Set up health insurance";
  if (lower.includes("criminal") || lower.includes("background"))
    return "Prepare legal documents";
  if (lower.includes("accommodation") || lower.includes("rental"))
    return "Secure accommodation";
  return null;
}

export default function DashboardDocuments({ profile, onBack }: Props) {
  const { user } = useAuth();
  const [userDocs, setUserDocs] = useState<UserDoc[]>([]);
  const [visaDocs, setVisaDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadDoc, setActiveUploadDoc] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ identity: true });
  const isLocked = (profile?.plan || "free") !== "full";

  const fetchData = async () => {
    if (!user) return;
    const [docsRes, visaRes] = await Promise.all([
      supabase.from("user_documents").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false }),
      supabase.from("visa_documents").select("*").eq("visa_type", profile?.visa_type || "TBD"),
    ]);
    setUserDocs((docsRes.data || []) as UserDoc[]);
    setVisaDocs(visaRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user, profile]);

  // Build required documents list
  const requiredDocs: RequiredDoc[] = useMemo(() => {
    // Start with visa-specific docs
    const docs: RequiredDoc[] = (visaDocs || []).map((vd: any) => {
      const matched = userDocs.find(ud =>
        ud.document_name.toLowerCase().includes(vd.document_name.toLowerCase().split(" ")[0])
      );
      return {
        id: vd.id,
        document_name: vd.document_name,
        description: vd.description,
        is_required: vd.is_required,
        category: categorizeDoc(vd.document_name),
        uploadedDoc: matched || null,
        aiStatus: getAiStatus(matched || null),
        usedFor: getUsedFor(vd.document_name),
      };
    });

    // Add user-uploaded docs that don't match any visa doc
    const matchedIds = new Set(docs.filter(d => d.uploadedDoc).map(d => d.uploadedDoc!.id));
    for (const ud of userDocs) {
      if (!matchedIds.has(ud.id)) {
        docs.push({
          id: ud.id,
          document_name: ud.document_name,
          description: null,
          is_required: false,
          category: categorizeDoc(ud.document_name),
          uploadedDoc: ud,
          aiStatus: getAiStatus(ud),
          usedFor: getUsedFor(ud.document_name),
        });
      }
    }

    // If no visa docs exist, show default required list
    if (visaDocs.length === 0 && userDocs.length === 0) {
      const defaults = [
        { name: "Valid passport", desc: "Must be valid for 6+ months", cat: "identity", req: true },
        { name: "Passport photos (6 pcs)", desc: "Biometric format, white background", cat: "identity", req: true },
        { name: "Proof of income", desc: "Bank statements or employment contract", cat: "financial", req: true },
        { name: "Bank statements", desc: "Last 3-6 months", cat: "financial", req: true },
        { name: "Health insurance", desc: "International coverage", cat: "legal", req: true },
        { name: "Criminal background check", desc: "From country of citizenship, apostilled", cat: "legal", req: true },
        { name: "Proof of accommodation", desc: "Rental agreement or booking", cat: "legal", req: false },
        { name: "Tax returns", desc: "Previous year", cat: "financial", req: false },
      ];
      return defaults.map((d, i) => ({
        id: `default-${i}`,
        document_name: d.name,
        description: d.desc,
        is_required: d.req,
        category: d.cat,
        uploadedDoc: null,
        aiStatus: null,
        usedFor: getUsedFor(d.name),
      }));
    }

    return docs;
  }, [visaDocs, userDocs]);

  const readyCount = requiredDocs.filter(d => d.uploadedDoc).length;
  const totalCount = requiredDocs.length;
  const progressPct = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || isLocked) return;

    setUploading(activeUploadDoc || file.name);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${user.id}/${Date.now()}_${sanitizedName}`;
    const { error: uploadError } = await supabase.storage.from("user-documents").upload(path, file);

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("user-documents").getPublicUrl(path);
    const docName = activeUploadDoc || file.name;

    await supabase.from("user_documents").insert({
      user_id: user.id,
      document_name: docName,
      status: "pending",
      file_url: urlData.publicUrl,
    });

    setTimeout(async () => {
      await supabase.from("user_documents").update({ status: "uploaded" }).eq("user_id", user.id).eq("document_name", docName);
      fetchData();
    }, 2000);

    toast.success("Document uploaded");
    setUploading(null);
    setActiveUploadDoc(null);
    fetchData();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const deleteDoc = async (doc: UserDoc) => {
    if (!user) return;
    if (doc.file_url) {
      const pathMatch = doc.file_url.match(/user-documents\/(.+)$/);
      if (pathMatch) await supabase.storage.from("user-documents").remove([pathMatch[1]]);
    }
    await supabase.from("user_documents").delete().eq("id", doc.id);
    toast.success("Document removed");
    fetchData();
  };

  const triggerUploadFor = (docName: string) => {
    setActiveUploadDoc(docName);
    fileInputRef.current?.click();
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-48" /><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="space-y-8 relative">
      {isLocked && showPaywall && <LockedOverlay onClose={() => { setShowPaywall(false); onBack?.(); }} />}
      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.docx,.doc,.xlsx,.xls,.txt,.webp" onChange={handleUpload} className="hidden" />

      <div className={isLocked ? "pointer-events-none" : ""}>

        {/* ─── HEADER + PROGRESS ─── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-7"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Your documents</p>
            <span className="text-[12px] text-muted-foreground">{readyCount} / {totalCount} ready</span>
          </div>

          <Progress value={progressPct} className="h-1.5 bg-white/[0.06] mb-4" />

          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Document checklist</h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                Personalized for your {profile?.visa_type?.replace(/_/g, " ") || "relocation"} path
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setActiveUploadDoc(null); fileInputRef.current?.click(); }}
              className="gap-2 text-[12px] border-white/[0.08] bg-transparent hover:bg-white/[0.04] shrink-0"
            >
              <Upload size={14} /> Upload
            </Button>
          </div>
        </motion.section>

        {/* ─── DOCUMENT CATEGORIES ─── */}
        {CATEGORIES.map((cat, catIndex) => {
          const catDocs = requiredDocs.filter(d => d.category === cat.key);
          if (catDocs.length === 0) return null;

          const catReady = catDocs.filter(d => d.uploadedDoc).length;
          const isOpen = openCategories[cat.key] ?? false;

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + catIndex * 0.08, duration: 0.4 }}
            >
              <Collapsible open={isOpen} onOpenChange={(open) => setOpenCategories(prev => ({ ...prev, [cat.key]: open }))}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] p-4 md:p-5 transition-colors text-left group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-[14px] font-semibold">{cat.label}</h2>
                        <span className="text-[11px] text-muted-foreground/60">{catReady}/{catDocs.length}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground/60">{cat.description}</p>
                    </div>
                    {/* Mini progress */}
                    <div className="w-16 shrink-0">
                      <Progress value={catDocs.length > 0 ? (catReady / catDocs.length) * 100 : 0} className="h-1 bg-white/[0.06]" />
                    </div>
                    <ChevronDown size={16} className={`text-muted-foreground/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-2 mt-2">
                    {catDocs.map((doc) => {
                      const hasUpload = !!doc.uploadedDoc;
                      const relatedTask = getRelatedTask(doc.document_name);

                      return (
                        <div
                          key={doc.id}
                          className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 md:px-5 md:py-4"
                        >
                          <div className="flex items-start gap-3">
                            {/* Status icon */}
                            <div className="mt-0.5 shrink-0">
                              {hasUpload && doc.uploadedDoc!.status === "verified" ? (
                                <CheckCircle2 size={18} className="text-primary" />
                              ) : hasUpload ? (
                                <Clock size={18} className="text-amber-400" />
                              ) : (
                                <AlertCircle size={18} className="text-muted-foreground/30" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[13px] font-medium">{doc.document_name}</span>
                                {doc.is_required && (
                                  <span className="text-[9px] uppercase tracking-wider text-primary/70 font-medium">Required</span>
                                )}
                              </div>

                              {doc.description && (
                                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{doc.description}</p>
                              )}

                              {/* Status badge */}
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                                  hasUpload && doc.uploadedDoc!.status === "verified"
                                    ? "bg-primary/10 text-primary"
                                    : hasUpload
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-white/[0.04] text-muted-foreground/50"
                                }`}>
                                  {hasUpload
                                    ? doc.uploadedDoc!.status === "verified" ? "Uploaded" : "Needs review"
                                    : "Missing"
                                  }
                                </span>

                                {/* Used for */}
                                <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
                                  <Link2 size={9} /> {doc.usedFor}
                                </span>
                              </div>

                              {/* AI Status */}
                              {doc.aiStatus && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  <Sparkles size={11} className="text-primary/60" />
                                  <span className="text-[10px] text-primary/70">{doc.aiStatus}</span>
                                </div>
                              )}

                              {/* Related task */}
                              {relatedTask && (
                                <div className="mt-2">
                                  <span className="text-[10px] text-muted-foreground/40">Required for: {relatedTask}</span>
                                </div>
                              )}
                            </div>

                            {/* Action */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {hasUpload ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[11px] text-muted-foreground/50 hover:text-foreground h-7 px-2"
                                    onClick={() => triggerUploadFor(doc.document_name)}
                                  >
                                    Replace
                                  </Button>
                                  <button
                                    onClick={() => deleteDoc(doc.uploadedDoc!)}
                                    className="text-muted-foreground/30 hover:text-red-400 transition-colors p-1"
                                  >
                                    <X size={13} />
                                  </button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[11px] border-white/[0.08] bg-transparent hover:bg-white/[0.04] h-7 gap-1.5"
                                  onClick={() => triggerUploadFor(doc.document_name)}
                                  disabled={uploading === doc.document_name}
                                >
                                  <Upload size={12} />
                                  {uploading === doc.document_name ? "Uploading..." : "Upload"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          );
        })}

        {/* ─── PERSONALIZATION NOTE ─── */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-muted-foreground/40">
            Personalized for your profile · AI verification is automatic
          </p>
        </div>
      </div>
    </div>
  );
}
