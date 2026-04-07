import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, CheckCircle2, AlertCircle, Clock, FileText, Sparkles, ChevronDown, Link2, Image, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import LockedOverlay from "./LockedOverlay";
import DocumentPreviewModal from "./DocumentPreviewModal";
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
  onNavigate?: (tab: string) => void;
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
  if (doc.status === "pending") return "AI is analyzing your document…";
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

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|webp|heic|heif)(\?|$)/i.test(url);
}

function getFileExtension(url: string): string {
  const match = url.match(/\.(\w+)(\?|$)/);
  return match ? match[1].toUpperCase() : "FILE";
}

function getStatusConfig(status: string) {
  switch (status) {
    case "verified":
      return { icon: CheckCircle2, label: "✔ Uploaded", color: "text-primary", bg: "bg-primary/10" };
    case "pending":
      return { icon: Sparkles, label: "🤖 AI analyzing", color: "text-blue-400", bg: "bg-blue-500/10" };
    case "uploaded":
      return { icon: Clock, label: "⚠ Needs review", color: "text-amber-400", bg: "bg-amber-500/10" };
    default:
      return { icon: AlertCircle, label: "⚠ Needs attention", color: "text-amber-400", bg: "bg-amber-500/10" };
  }
}

export default function DashboardDocuments({ profile, onBack, onNavigate }: Props) {
  const { user } = useAuth();
  const [userDocs, setUserDocs] = useState<UserDoc[]>([]);
  const [visaDocs, setVisaDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadDoc, setActiveUploadDoc] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ identity: true });
  const [previewDoc, setPreviewDoc] = useState<{ doc: UserDoc; aiStatus: string | null; usedFor: string; signedUrl: string | null } | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const isLocked = (profile?.plan || "free") !== "full";

  // Generate signed URLs for all uploaded docs
  const refreshSignedUrls = async (docs: UserDoc[]) => {
    const docsWithFiles = docs.filter(d => d.file_url);
    if (docsWithFiles.length === 0) { setSignedUrls({}); return; }

    const urls: Record<string, string> = {};
    await Promise.all(
      docsWithFiles.map(async (doc) => {
        let storagePath = doc.file_url!;
        // Handle legacy full URLs: extract path after bucket name
        if (storagePath.startsWith("http")) {
          const match = storagePath.match(/user-documents\/(.+)$/);
          if (match) {
            storagePath = match[1];
          } else {
            return; // Can't extract path
          }
        }
        const { data, error } = await supabase.storage
          .from("user-documents")
          .createSignedUrl(storagePath, 3600);
        if (data?.signedUrl && !error) {
          urls[doc.id] = data.signedUrl;
        }
      })
    );
    setSignedUrls(urls);
  };

  const fetchData = async () => {
    if (!user) return;
    const [docsRes, visaRes] = await Promise.all([
      supabase.from("user_documents").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false }),
      supabase.from("visa_documents").select("*").eq("visa_type", profile?.visa_type || "TBD"),
    ]);
    const fetchedDocs = (docsRes.data || []) as UserDoc[];
    setUserDocs(fetchedDocs);
    setVisaDocs(visaRes.data || []);
    await refreshSignedUrls(fetchedDocs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user, profile]);

  const requiredDocs: RequiredDoc[] = useMemo(() => {
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

    const docName = activeUploadDoc || file.name;

    await supabase.from("user_documents").insert({
      user_id: user.id,
      document_name: docName,
      status: "pending",
      file_url: path, // Store the storage path, not public URL
    });

    toast.success("Uploaded successfully. AI is analyzing your document.", {
      duration: 4000,
      icon: <Sparkles size={14} className="text-primary" />,
    });

    setTimeout(async () => {
      await supabase.from("user_documents").update({ status: "uploaded" }).eq("user_id", user.id).eq("document_name", docName);
      fetchData();
    }, 2000);

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

      {/* Preview Modal */}
      <DocumentPreviewModal
        open={!!previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
        doc={previewDoc?.doc || null}
        signedUrl={previewDoc?.signedUrl || null}
        aiStatus={previewDoc?.aiStatus || null}
        usedFor={previewDoc?.usedFor || ""}
        onReplace={() => previewDoc && triggerUploadFor(previewDoc.doc.document_name)}
        onDelete={() => previewDoc && deleteDoc(previewDoc.doc)}
      />

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

          {/* ─── Journey Line (unified with Overview) ─── */}
          <div className="relative my-5 h-[12px] flex items-center">
            {/* Track */}
            <div className="absolute left-[6px] right-[6px] h-[2px] rounded-full bg-white/[0.06]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(190 80% 60%))" }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full opacity-60"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.6) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "energyFlow 3s ease-in-out infinite",
                  width: `${progressPct}%`,
                }}
              />
            </div>
            {/* Start dot */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <div className="w-[8px] h-[8px] rounded-full bg-primary shadow-[0_0_6px_1px_hsl(var(--primary)/0.3)]" />
            </div>
            {/* Current position */}
            {progressPct > 0 && progressPct < 100 && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 z-10"
                initial={{ left: "6px" }}
                animate={{ left: `calc(6px + (100% - 12px) * ${progressPct / 100})` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ marginLeft: "-6px" }}
              >
                <div className="relative">
                  <div className="w-[12px] h-[12px] rounded-full bg-primary shadow-[0_0_12px_3px_hsl(var(--primary)/0.4)]" />
                  <div className="absolute inset-0 w-[12px] h-[12px] rounded-full bg-primary/40 animate-ping" style={{ animationDuration: "2.5s" }} />
                </div>
              </motion.div>
            )}
            {/* End dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <div className={`w-[8px] h-[8px] rounded-full ${progressPct >= 100 ? "bg-primary shadow-[0_0_6px_1px_hsl(var(--primary)/0.3)]" : "bg-white/[0.08] border border-white/[0.12]"}`} />
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground/50 font-medium">Start</span>
            <span className="text-[10px] text-muted-foreground/50 font-medium">Stable life</span>
          </div>

          {/* Subtitle */}
          <p className="text-[10px] text-muted-foreground/40 text-center mb-4">From uncertainty → stability</p>

          {/* Phase indicator */}
          {(() => {
            const identityDocs = requiredDocs.filter(d => d.category === "identity");
            const financialDocs = requiredDocs.filter(d => d.category === "financial");
            const identityReady = identityDocs.every(d => d.uploadedDoc);
            const financialReady = financialDocs.every(d => d.uploadedDoc);
            const currentPhase = !identityReady ? "Identity verification" : !financialReady ? "Financial proof" : "Legal documents";
            return (
              <p className="text-[11px] text-center text-muted-foreground/60">
                You are currently in: <span className="text-primary/80 font-medium">{currentPhase}</span>
              </p>
            );
          })()}

          <div className="flex items-start gap-3 mt-5">
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
                      const statusConfig = hasUpload ? getStatusConfig(doc.uploadedDoc!.status) : null;

                      return (
                        <div
                          key={doc.id}
                          className={`rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 md:px-5 md:py-4 group/card transition-colors ${
                            hasUpload ? "hover:bg-white/[0.04] cursor-pointer" : ""
                          }`}
                          onClick={hasUpload ? () => setPreviewDoc({ doc: doc.uploadedDoc!, aiStatus: doc.aiStatus, usedFor: doc.usedFor, signedUrl: signedUrls[doc.uploadedDoc!.id] || null }) : undefined}
                        >
                          <div className="flex items-start gap-3">
                            {/* Thumbnail / Icon */}
                            <div className="mt-0.5 shrink-0">
                              {hasUpload && doc.uploadedDoc!.file_url && isImageUrl(doc.uploadedDoc!.file_url) && signedUrls[doc.uploadedDoc!.id] ? (
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/[0.06] bg-white/[0.03]">
                                  <img
                                    src={signedUrls[doc.uploadedDoc!.id]}
                                    alt={doc.document_name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye size={14} className="text-white" />
                                  </div>
                                </div>
                              ) : hasUpload && doc.uploadedDoc!.file_url ? (
                                <div className="relative w-10 h-10 rounded-lg border border-white/[0.06] bg-white/[0.03] flex flex-col items-center justify-center">
                                  <FileText size={16} className="text-muted-foreground/40" />
                                  <span className="text-[7px] text-muted-foreground/30 font-medium mt-0.5">
                                    {getFileExtension(doc.uploadedDoc!.file_url)}
                                  </span>
                                  <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye size={14} className="text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg border border-dashed border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
                                  <AlertCircle size={16} className="text-muted-foreground/20" />
                                </div>
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
                                {hasUpload && statusConfig ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                    {statusConfig.label}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-muted-foreground/50">
                                    Missing
                                  </span>
                                )}

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
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onNavigate?.("checklist"); }}
                                    className="text-[10px] text-primary/60 hover:text-primary/80 transition-colors"
                                  >
                                    Required for: {relatedTask} →
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Action */}
                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {hasUpload ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[11px] text-muted-foreground/50 hover:text-foreground h-7 px-2 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                    onClick={() => setPreviewDoc({ doc: doc.uploadedDoc!, aiStatus: doc.aiStatus, usedFor: doc.usedFor, signedUrl: signedUrls[doc.uploadedDoc!.id] || null })}
                                  >
                                    <Eye size={12} className="mr-1" /> View
                                  </Button>
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
                                  {uploading === doc.document_name ? "Uploading…" : "Upload"}
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
