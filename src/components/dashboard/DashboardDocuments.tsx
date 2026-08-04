import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle2, AlertCircle, Clock, FileText, Sparkles, ChevronDown, Link2, Eye, ArrowRight, Download, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import LockedOverlay from "./LockedOverlay";
import DocumentPreviewModal from "./DocumentPreviewModal";
import VisaLetterGenerator from "./VisaLetterGenerator";
import type { UserProfile } from "@/pages/Dashboard";
import type { RelocationCase } from "@/hooks/useRelocationCase";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserDoc {
  id: string;
  document_name: string;
  status: string;
  file_url: string | null;
  storage_path: string | null;
  verification_status: "pending" | "ok" | "warning" | "mismatch" | null;
  verification_note: string | null;
  prepared_without_upload: boolean | null;
  related_step_title: string | null;
  uploaded_at: string;
}

interface RequiredDoc {
  id: string;           // user_documents.id for new users
  document_name: string;
  description: string | null;
  is_required: boolean;
  category: string;
  userDocId: string | null;    // user_documents.id for UPDATE operations
  uploadedDoc: UserDoc | null; // non-null when a file is actually uploaded
  isPrepared: boolean;
  verificationStatus: string | null;
  verificationNote: string | null;
  aiStatus: string | null;
  usedFor: string;
  related_step_title: string | null;
}

interface ActiveUpload { id: string | null; name: string }

interface Props {
  profile: UserProfile | null;
  onBack?: () => void;
  onNavigate?: (tab: string) => void;
  relocationCase: RelocationCase;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "identity",  label: "Identity",       description: "Personal identification documents" },
  { key: "financial", label: "Financial proof", description: "Income and financial documentation" },
  { key: "legal",     label: "Legal documents", description: "Permits, certificates, and legal paperwork" },
];

const DEFAULT_DOCS = [
  { name: "Valid passport",               desc: "Must be valid for 6+ months", cat: "identity",  req: true  },
  { name: "Passport photos (6 pcs)",      desc: "Biometric format, white background", cat: "identity",  req: true  },
  { name: "Proof of income",              desc: "Bank statements or employment contract", cat: "financial", req: true  },
  { name: "Bank statements",              desc: "Last 3-6 months", cat: "financial", req: true  },
  { name: "Health insurance",             desc: "International coverage", cat: "legal",     req: true  },
  { name: "Criminal background check",    desc: "From country of citizenship, apostilled", cat: "legal",     req: true  },
  { name: "Proof of accommodation",       desc: "Rental agreement or hotel booking", cat: "legal",     req: false },
  { name: "Tax returns",                  desc: "Previous year", cat: "financial", req: false },
];

function categorizeDoc(name: string): string {
  const l = name.toLowerCase();
  if (l.includes("passport") || l.includes("id") || l.includes("photo") || l.includes("birth")) return "identity";
  if (l.includes("bank") || l.includes("income") || l.includes("tax") || l.includes("financial") || l.includes("statement")) return "financial";
  return "legal";
}

function getUsedFor(name: string): string {
  const l = name.toLowerCase();
  if (l.includes("passport")) return "Visa application, residence permit";
  if (l.includes("photo")) return "Visa application, ID card";
  if (l.includes("bank") || l.includes("statement")) return "Proof of funds, visa application";
  if (l.includes("income") || l.includes("tax")) return "Residence permit, tax registration";
  if (l.includes("insurance")) return "Visa application, residence permit";
  if (l.includes("criminal") || l.includes("background")) return "Residence permit application";
  if (l.includes("marriage")) return "Family visa, dependent permit";
  if (l.includes("birth")) return "Family visa, citizenship application";
  if (l.includes("cv") || l.includes("resume")) return "Work permit application";
  if (l.includes("accommodation") || l.includes("rental")) return "Address registration, visa";
  if (l.includes("nif") || l.includes("nie") || l.includes("emirates")) return "Tax registration, residence";
  return "Relocation process";
}

function getRelatedTask(name: string): string | null {
  const l = name.toLowerCase();
  if (l.includes("passport") || l.includes("photo") || l.includes("copy")) return "Prepare travel documents";
  if (l.includes("bank") || l.includes("financial") || l.includes("statement")) return "Set up finances";
  if (l.includes("insurance")) return "Set up health insurance";
  if (l.includes("criminal") || l.includes("background")) return "Prepare legal documents";
  if (l.includes("accommodation") || l.includes("rental")) return "Secure accommodation";
  return null;
}

function isImageFile(path: string): boolean {
  return /\.(jpg|jpeg|png|webp|heic|heif)(\?|$)/i.test(path);
}

function getFileExtension(path: string): string {
  const m = path.match(/\.(\w+)(\?|$)/);
  return m ? m[1].toUpperCase() : "FILE";
}

/** Returns the clean storage path (strips legacy full URLs) */
function getStoragePath(doc: UserDoc): string | null {
  const raw = doc.storage_path || doc.file_url;
  if (!raw) return null;
  if (raw.startsWith("http")) {
    const m = raw.match(/user-documents\/(.+)$/);
    return m ? m[1] : null;
  }
  return raw;
}

function getStatusConfig(doc: RequiredDoc) {
  if (!doc.uploadedDoc && !doc.isPrepared) {
    return {
      label: "Missing",
      color: "text-muted-foreground/50",
      bg: "bg-white/[0.04]",
      cardClass: "",
    };
  }
  if (doc.isPrepared && !doc.uploadedDoc) {
    return {
      label: "✓ Marked as ready",
      color: "text-muted-foreground/70",
      bg: "bg-white/[0.06]",
      cardClass: "",
    };
  }
  switch (doc.verificationStatus) {
    case "ok":
      return {
        label: "✔ Verified",
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-500/15",
        cardClass: "!border-[1.5px] !border-[hsl(142_60%_45%)] !bg-[hsl(142_60%_96%)] dark:!bg-[hsl(142_40%_12%)] dark:!border-[hsl(142_50%_40%)]",
      };
    case "warning":
      return {
        label: "⚠ Needs review",
        color: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-500/15",
        cardClass: "!border-[1.5px] !border-[hsl(38_90%_50%)] !bg-[hsl(38_90%_96%)] dark:!bg-[hsl(38_40%_14%)] dark:!border-[hsl(38_70%_45%)]",
      };
    case "mismatch":
      return {
        label: "✗ Rejected",
        color: "text-red-700 dark:text-red-400",
        bg: "bg-red-500/15",
        cardClass: "!border-[1.5px] !border-[hsl(0_70%_50%)] !bg-[hsl(0_70%_97%)] dark:!bg-[hsl(0_40%_14%)] dark:!border-[hsl(0_60%_45%)]",
      };
    case "pending":
      return {
        label: "Verifying…",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        cardClass: "",
      };
    default:
      return {
        label: "✔ Uploaded",
        color: "text-green-400",
        bg: "bg-green-500/10",
        cardClass: "",
      };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardDocuments({ profile, onBack, onNavigate, relocationCase }: Props) {
  const { user } = useAuth();
  const [userDocs, setUserDocs] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUpload, setActiveUpload] = useState<ActiveUpload | null>(null);
  const [showPaywall, setShowPaywall] = useState(true);
  const [showLetterGenerator, setShowLetterGenerator] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ identity: true });
  const [previewDoc, setPreviewDoc] = useState<{ doc: UserDoc; verificationNote: string | null; usedFor: string; signedUrl: string | null } | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const isLocked = (profile?.plan || "free") !== "full" && (profile?.plan || "free") !== "concierge";

  // ── Signed URLs (for preview thumbnails, 1h) ────────────────────────────────
  const refreshSignedUrls = useCallback(async (docs: UserDoc[]) => {
    const docsWithFiles = docs.filter(d => getStoragePath(d));
    if (docsWithFiles.length === 0) { setSignedUrls({}); return; }
    const urls: Record<string, string> = {};
    await Promise.all(docsWithFiles.map(async (doc) => {
      const path = getStoragePath(doc);
      if (!path) return;
      const { data, error } = await supabase.storage.from("user-documents").createSignedUrl(path, 3600);
      if (data?.signedUrl && !error) urls[doc.id] = data.signedUrl;
    }));
    setSignedUrls(urls);
  }, []);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: true });
    const fetchedDocs = (data || []) as UserDoc[];
    setUserDocs(fetchedDocs);
    await refreshSignedUrls(fetchedDocs);
    setLoading(false);
  }, [user, refreshSignedUrls]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── requiredDocs computation ────────────────────────────────────────────────
  const requiredDocs: RequiredDoc[] = useMemo(() => {
    if (userDocs.length > 0) {
      return userDocs.map((ud) => {
        const hasFile = !!(ud.storage_path || ud.file_url);
        return {
          id: ud.id,
          document_name: ud.document_name,
          description: null,
          is_required: ud.status !== "optional",
          category: categorizeDoc(ud.document_name),
          userDocId: ud.id,
          uploadedDoc: hasFile ? ud : null,
          isPrepared: !hasFile && (ud.prepared_without_upload ?? false),
          verificationStatus: ud.verification_status,
          verificationNote: ud.verification_note,
          aiStatus: null,
          usedFor: getUsedFor(ud.document_name),
          related_step_title: ud.related_step_title ?? null,
        };
      });
    }
    // Fallback for users without onboarding data
    return DEFAULT_DOCS.map((d, i) => ({
      id: `default-${i}`,
      document_name: d.name,
      description: d.desc,
      is_required: d.req,
      category: d.cat,
      userDocId: null,
      uploadedDoc: null,
      isPrepared: false,
      verificationStatus: null,
      verificationNote: null,
      aiStatus: null,
      usedFor: getUsedFor(d.name),
      related_step_title: null,
    }));
  }, [userDocs]);

  const readyCount = requiredDocs.filter(d => d.uploadedDoc || d.isPrepared).length;
  const totalCount = requiredDocs.length;
  const progressPct = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  // ── AI Verification (runs in background after upload) ──────────────────────
  const runAiVerification = useCallback(async (docId: string, file: File) => {
    // Only check images; skip if too large (>4 MB to avoid slow base64 + API limits)
    if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) return;

    try {
      const base64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("verify-document", {
        body: { imageBase64: base64, documentType: userDocs.find(d => d.id === docId)?.document_name || file.name, mimeType: file.type },
      });
      if (error || !data) return;

      const { status, note } = data as { status: string; note: string };
      await supabase.from("user_documents")
        .update({ verification_status: status, verification_note: note, status: status === "ok" ? "verified" : "uploaded" })
        .eq("id", docId);
      await fetchData();

      if (status === "ok") toast.success("Document verified ✓", { duration: 3000 });
      else if (status === "warning") toast.warning(`⚠ ${note}`, { duration: 5000 });
      else if (status === "mismatch") toast.error(`Document mismatch: ${note}`, { duration: 5000 });
    } catch {
      // AI verification is best-effort; never block the user
    }
  }, [userDocs, fetchData]);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || isLocked) return;

    const docId   = activeUpload?.id ?? null;
    const docName = activeUpload?.name || file.name;
    setUploading(docId || docName);

    const sanitized  = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/${docId || Date.now()}-${sanitized}`;

    // If replacing, delete old file first
    if (docId) {
      const existing = userDocs.find(d => d.id === docId);
      const oldPath = existing ? getStoragePath(existing) : null;
      if (oldPath) await supabase.storage.from("user-documents").remove([oldPath]);
    }

    const { error: uploadError } = await supabase.storage
      .from("user-documents")
      .upload(storagePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(null);
      return;
    }

    if (docId) {
      // UPDATE existing user_documents row
      await supabase.from("user_documents").update({
        storage_path: storagePath,
        file_url: storagePath,
        verification_status: "pending",
        verification_note: null,
        prepared_without_upload: false,
        status: "pending",
        uploaded_at: new Date().toISOString(),
      }).eq("id", docId);
    } else {
      // INSERT new row (generic upload)
      await supabase.from("user_documents").insert({
        user_id: user.id,
        document_name: docName,
        status: "pending",
        storage_path: storagePath,
        file_url: storagePath,
        verification_status: "pending",
      });
    }

    toast.success("Uploaded! Verification starting…", {
      duration: 4000,
      icon: <Sparkles size={14} className="text-primary" />,
    });

    setUploading(null);
    setActiveUpload(null);
    await fetchData();
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Run AI check in background (non-blocking)
    if (docId) {
      runAiVerification(docId, file);
    } else {
      // For newly inserted rows, find the id after fetchData
      const { data } = await supabase.from("user_documents").select("id").eq("user_id", user.id).eq("document_name", docName).order("uploaded_at", { ascending: false }).limit(1).maybeSingle();
      if (data?.id) runAiVerification(data.id, file);
    }
  };

  const triggerUploadFor = (docId: string | null, docName: string) => {
    setActiveUpload({ id: docId, name: docName });
    fileInputRef.current?.click();
  };

  // ── Mark as prepared (no file) ───────────────────────────────────────────
  const markPrepared = async (docId: string) => {
    if (!user || !docId) return;
    await supabase.from("user_documents")
      .update({ prepared_without_upload: true, verification_status: null, verification_note: null })
      .eq("id", docId).eq("user_id", user.id);
    toast.success("Marked as ready");
    await fetchData();
  };

  const unmarkPrepared = async (docId: string) => {
    if (!user || !docId) return;
    await supabase.from("user_documents")
      .update({ prepared_without_upload: false })
      .eq("id", docId).eq("user_id", user.id);
    await fetchData();
  };

  // ── Download — blob-based to bypass cross-origin <a download> restriction ──
  const downloadDoc = async (doc: UserDoc) => {
    const path = getStoragePath(doc);
    if (!path) return;
    setDownloading(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("user-documents")
        .createSignedUrl(path, 600);
      if (error || !data?.signedUrl) {
        toast.error("Could not generate download link");
        return;
      }
      const resp = await fetch(data.signedUrl);
      if (!resp.ok) throw new Error("fetch failed");
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = doc.document_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Could not download file");
    } finally {
      setDownloading(null);
    }
  };

  // ── Delete (reset row, don't delete it from plan) ───────────────────────
  const deleteDoc = async (doc: UserDoc) => {
    if (!user) return;
    const path = getStoragePath(doc);
    if (path) await supabase.storage.from("user-documents").remove([path]);
    // Reset upload fields but keep the row in the plan
    await supabase.from("user_documents").update({
      storage_path: null,
      file_url: null,
      verification_status: null,
      verification_note: null,
      prepared_without_upload: false,
      status: "pending",
    }).eq("id", doc.id).eq("user_id", user.id);
    toast.success("Document removed");
    await fetchData();
  };

  // ── Guards ───────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-48" /><Skeleton className="h-48" /></div>;
  }

  if (showLetterGenerator) {
    return <VisaLetterGenerator profile={profile} onBack={() => setShowLetterGenerator(false)} />;
  }

  return (
    <div className="space-y-8 relative">
      {isLocked && showPaywall && <LockedOverlay onClose={() => { setShowPaywall(false); onBack?.(); }} profile={profile} />}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.docx,.doc,.xlsx,.xls,.txt,.webp"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Preview Modal */}
      <DocumentPreviewModal
        open={!!previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
        doc={previewDoc?.doc || null}
        signedUrl={previewDoc?.signedUrl || null}
        aiStatus={previewDoc?.verificationNote || null}
        usedFor={previewDoc?.usedFor || ""}
        onReplace={() => previewDoc && triggerUploadFor(previewDoc.doc.id, previewDoc.doc.document_name)}
        onDelete={() => previewDoc && deleteDoc(previewDoc.doc)}
      />

      <div className={isLocked ? "pointer-events-none" : ""}>

        {/* ─── HEADER + PROGRESS ─── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="surface-card p-5 md:p-7"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Your documents</p>
            <span className="text-[12px] text-muted-foreground">{readyCount} / {totalCount} ready</span>
          </div>

          {/* Journey Line */}
          <div className="relative my-5 h-[12px] flex items-center">
            <div className="absolute left-[6px] right-[6px] h-[2px] rounded-full bg-white/[0.06]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(190 80% 60%))" }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <div className="w-[8px] h-[8px] rounded-full bg-primary shadow-[0_0_6px_1px_hsl(var(--primary)/0.3)]" />
            </div>
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
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <div className={`w-[8px] h-[8px] rounded-full ${progressPct >= 100 ? "bg-primary shadow-[0_0_6px_1px_hsl(var(--primary)/0.3)]" : "bg-white/[0.08] border border-white/[0.12]"}`} />
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground/50 font-medium">Start</span>
            <span className="text-[10px] text-muted-foreground/50 font-medium">Stable life</span>
          </div>
          <p className="text-[10px] text-muted-foreground/40 text-center mb-4">From uncertainty → stability</p>
          <p className="text-[11px] text-center text-muted-foreground/60">
            Relocation: Phase {relocationCase.currentPhaseIndex + 1} of {relocationCase.totalPhases} · <span className="text-primary/80 font-medium">{relocationCase.currentPhase}</span>
          </p>

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
              onClick={() => { setActiveUpload(null); fileInputRef.current?.click(); }}
              className="gap-2 text-[12px] border-white/[0.08] bg-transparent hover:bg-white/[0.04] shrink-0"
            >
              <Upload size={14} /> Upload
            </Button>
          </div>
        </motion.section>

        {/* Visa Cover Letter Generator */}
        {!isLocked && (
          <div
            className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 cursor-pointer hover:bg-primary/[0.07] transition-colors"
            onClick={() => setShowLetterGenerator(true)}
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[14px]">Visa Cover Letter Generator</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Personalized cover letter for your {profile?.visa_type?.replace(/_/g, " ")} application — save $300+ on lawyers
                </p>
              </div>
              <ArrowRight size={16} className="text-primary shrink-0" />
            </div>
          </div>
        )}

        {/* ─── DOCUMENT CATEGORIES ─── */}
        {CATEGORIES.map((cat, catIndex) => {
          const catDocs = requiredDocs.filter(d => d.category === cat.key);
          if (catDocs.length === 0) return null;
          const catReady = catDocs.filter(d => d.uploadedDoc || d.isPrepared).length;
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
                  <button className="w-full flex items-center gap-3 surface-card hover:bg-muted p-4 md:p-5 transition-colors text-left group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-[14px] font-semibold">{cat.label}</h2>
                        <span className="text-[11px] text-muted-foreground/60">{catReady}/{catDocs.length}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground/60">{cat.description}</p>
                    </div>
                    <ChevronDown size={16} className={`text-muted-foreground/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-2 mt-2">
                    {catDocs.map((doc) => {
                      const hasUpload = !!doc.uploadedDoc;
                      const relatedTask = getRelatedTask(doc.document_name);
                      const statusCfg = getStatusConfig(doc);
                      const storagePath = doc.uploadedDoc ? getStoragePath(doc.uploadedDoc) : null;
                      const isImage = storagePath ? isImageFile(storagePath) : false;
                      const previewUrl = doc.uploadedDoc ? signedUrls[doc.uploadedDoc.id] : null;

                      return (
                        <div
                          key={doc.id}
                          className={`surface-card p-4 md:px-5 md:py-4 group/card transition-colors ${statusCfg.cardClass} ${hasUpload && !statusCfg.cardClass ? "hover:bg-muted cursor-pointer" : hasUpload ? "cursor-pointer" : ""}`}
                          onClick={hasUpload ? () => setPreviewDoc({
                            doc: doc.uploadedDoc!,
                            verificationNote: doc.verificationNote,
                            usedFor: doc.usedFor,
                            signedUrl: previewUrl || null,
                          }) : undefined}
                        >
                          <div className="flex items-start gap-3">

                            {/* Thumbnail / Icon */}
                            <div className="mt-0.5 shrink-0">
                              {hasUpload && isImage && previewUrl ? (
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/[0.06] bg-white/[0.03]">
                                  <img src={previewUrl} alt={doc.document_name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye size={14} className="text-white" />
                                  </div>
                                </div>
                              ) : hasUpload && storagePath ? (
                                <div className="relative w-10 h-10 rounded-lg border border-white/[0.06] bg-white/[0.03] flex flex-col items-center justify-center">
                                  <FileText size={16} className="text-muted-foreground/40" />
                                  <span className="text-[7px] text-muted-foreground/30 font-medium mt-0.5">{getFileExtension(storagePath)}</span>
                                  <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye size={14} className="text-white" />
                                  </div>
                                </div>
                              ) : doc.isPrepared ? (
                                <div className="w-10 h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
                                  <CheckCircle2 size={18} className="text-muted-foreground/40" />
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

                              {doc.related_step_title && (
                                <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                                  Needed for: {doc.related_step_title}
                                </p>
                              )}

                              {doc.description && (
                                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{doc.description}</p>
                              )}

                              {/* Status badge */}
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                                  {statusCfg.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
                                  <Link2 size={9} /> {doc.usedFor}
                                </span>
                              </div>

                              {/* Verification note */}
                              {doc.verificationNote && (doc.verificationStatus === "warning" || doc.verificationStatus === "mismatch") && (
                                <p className={`text-[11px] mt-1.5 flex items-start gap-1.5 ${
                                  doc.verificationStatus === "mismatch" ? "text-red-600/90 dark:text-red-400/80" : "text-amber-700/90 dark:text-amber-400/80"
                                }`}>
                                  <Sparkles size={10} className="text-primary/60 shrink-0 mt-0.5" />
                                  {doc.verificationNote}
                                </p>
                              )}

                              {/* Related task */}
                              {relatedTask && (
                                <div className="mt-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onNavigate?.("plan"); }}
                                    className="text-[10px] text-primary/60 hover:text-primary/80 transition-colors"
                                  >
                                    Required for: {relatedTask} →
                                  </button>
                                </div>
                              )}

                              {/* Needed for next step */}
                              {!doc.uploadedDoc && !doc.isPrepared && relocationCase.nextStep &&
                                doc.document_name.toLowerCase().includes(relocationCase.nextStep.title.toLowerCase().split(" ")[0]) && (
                                <div className="mt-1.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium">
                                    ⚡ Needed for your next step
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0 self-start mt-0.5" onClick={(e) => e.stopPropagation()}>
                              {hasUpload ? (
                                <>
                                  <Button
                                    variant="ghost" size="sm"
                                    className="text-[11px] text-muted-foreground/50 hover:text-foreground h-7 px-2 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                    onClick={() => setPreviewDoc({ doc: doc.uploadedDoc!, verificationNote: doc.verificationNote, usedFor: doc.usedFor, signedUrl: previewUrl || null })}
                                  >
                                    <Eye size={12} className="mr-1" /> View
                                  </Button>
                                  <Button
                                    variant="ghost" size="sm"
                                    className="text-[11px] text-muted-foreground/50 hover:text-foreground h-7 px-2 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                    onClick={() => downloadDoc(doc.uploadedDoc!)}
                                    disabled={downloading === doc.uploadedDoc!.id}
                                  >
                                    <Download size={12} className="mr-1" />
                                    {downloading === doc.uploadedDoc!.id ? "…" : "Save"}
                                  </Button>
                                  <Button
                                    variant={doc.verificationStatus === "mismatch" || doc.verificationStatus === "warning" ? "outline" : "ghost"}
                                    size="sm"
                                    className={
                                      doc.verificationStatus === "mismatch"
                                        ? "text-[11px] h-7 px-2 border-red-500/40 text-red-700 dark:text-red-400 hover:bg-red-500/10"
                                        : doc.verificationStatus === "warning"
                                        ? "text-[11px] h-7 px-2 border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                                        : "text-[11px] text-muted-foreground/50 hover:text-foreground h-7 px-2"
                                    }
                                    onClick={() => triggerUploadFor(doc.userDocId, doc.document_name)}
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
                              ) : doc.isPrepared ? (
                                <Button
                                  variant="ghost" size="sm"
                                  className="text-[11px] text-muted-foreground/40 hover:text-foreground h-7 px-2"
                                  onClick={() => doc.userDocId && unmarkPrepared(doc.userDocId)}
                                >
                                  <X size={11} className="mr-1" /> Unmark
                                </Button>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="outline" size="sm"
                                    className="text-[11px] border-white/[0.08] bg-transparent hover:bg-white/[0.04] h-7 gap-1.5"
                                    onClick={() => triggerUploadFor(doc.userDocId, doc.document_name)}
                                    disabled={uploading === (doc.userDocId || doc.document_name)}
                                  >
                                    <Upload size={12} />
                                    {uploading === (doc.userDocId || doc.document_name) ? "Uploading…" : "Upload"}
                                  </Button>
                                  {doc.userDocId && (
                                    <button
                                      onClick={() => markPrepared(doc.userDocId!)}
                                      className="flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors px-1"
                                    >
                                      <Check size={10} /> Mark as ready
                                    </button>
                                  )}
                                </div>
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

        {/* Footer note */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-muted-foreground/40">
            Personalized for your profile · Verification is automatic for image uploads
          </p>
        </div>
      </div>
    </div>
  );
}
