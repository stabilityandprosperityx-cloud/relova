import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Clock, Sparkles, AlertCircle, FileText, Link2, Download, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface UserDoc {
  id: string;
  document_name: string;
  status: string;
  file_url: string | null;
  uploaded_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doc: UserDoc | null;
  aiStatus: string | null;
  usedFor: string;
  onReplace: () => void;
  onDelete: () => void;
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|webp|heic|heif)(\?|$)/i.test(url);
}

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url);
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

export default function DocumentPreviewModal({ open, onOpenChange, doc, aiStatus, usedFor, onReplace, onDelete }: Props) {
  const [imgError, setImgError] = useState(false);

  if (!doc) return null;

  const statusConfig = getStatusConfig(doc.status);
  const StatusIcon = statusConfig.icon;
  const hasUrl = !!doc.file_url;
  const isImage = hasUrl && !imgError && isImageUrl(doc.file_url!);
  const isPdf = hasUrl && isPdfUrl(doc.file_url!);
  const ext = hasUrl ? getFileExtension(doc.file_url!) : "FILE";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setImgError(false); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-2xl bg-background border-white/[0.08] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* ─── Preview area ─── */}
        <div className="relative bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-center min-h-[240px] flex-1 overflow-hidden">
          {isImage ? (
            <img
              src={doc.file_url!}
              alt={doc.document_name}
              className="max-w-full max-h-[50vh] object-contain p-4"
              onError={() => setImgError(true)}
            />
          ) : isPdf ? (
            <iframe
              src={doc.file_url!}
              title={doc.document_name}
              className="w-full h-[50vh] border-0"
            />
          ) : hasUrl ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex flex-col items-center justify-center">
                <FileText size={32} className="text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/40 font-medium mt-1">{ext}</span>
              </div>
              <p className="text-[12px] text-muted-foreground/50">
                Preview not available for this file type
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] border-white/[0.08] bg-transparent hover:bg-white/[0.04] gap-2"
                onClick={() => window.open(doc.file_url!, "_blank")}
              >
                <ExternalLink size={12} /> Open in new tab
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <FileText size={32} className="text-muted-foreground/20" />
              </div>
              <p className="text-[12px] text-muted-foreground/40">No file uploaded</p>
            </div>
          )}
        </div>

        {/* ─── Details ─── */}
        <div className="p-5 space-y-4 shrink-0">
          <DialogHeader className="p-0">
            <DialogTitle className="text-[15px] font-semibold">{doc.document_name}</DialogTitle>
          </DialogHeader>

          {/* Status + AI */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${statusConfig.bg} ${statusConfig.color}`}>
              <StatusIcon size={12} />
              {statusConfig.label}
            </span>
            {aiStatus && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-primary/[0.06] text-primary/70">
                <Sparkles size={11} />
                {aiStatus}
              </span>
            )}
          </div>

          {/* Used for */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Link2 size={10} />
            <span>Used for: {usedFor}</span>
          </div>

          {/* Upload date */}
          <p className="text-[10px] text-muted-foreground/30">
            Uploaded {new Date(doc.uploaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {hasUrl && (
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] border-white/[0.08] bg-transparent hover:bg-white/[0.04] gap-1.5 flex-1"
                asChild
              >
                <a href={doc.file_url!} download target="_blank" rel="noopener noreferrer">
                  <Download size={12} /> Download
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] border-white/[0.08] bg-transparent hover:bg-white/[0.04] gap-1.5 flex-1"
              onClick={() => { onReplace(); onOpenChange(false); }}
            >
              <RefreshCw size={12} /> Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[11px] text-red-400/60 hover:text-red-400 hover:bg-red-500/10 h-8 px-3 gap-1.5"
              onClick={() => { onDelete(); onOpenChange(false); }}
            >
              <Trash2 size={12} /> Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
