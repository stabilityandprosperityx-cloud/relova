import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Clock, Sparkles, AlertCircle, FileText, Image, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  if (!doc) return null;

  const statusConfig = getStatusConfig(doc.status);
  const StatusIcon = statusConfig.icon;
  const isImage = doc.file_url ? isImageUrl(doc.file_url) : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-white/[0.08] p-0 overflow-hidden">
        {/* Preview area */}
        <div className="relative bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-center min-h-[200px] max-h-[320px]">
          {doc.file_url && isImage ? (
            <img
              src={doc.file_url}
              alt={doc.document_name}
              className="max-w-full max-h-[320px] object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-16 h-16 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <FileText size={28} className="text-muted-foreground/40" />
              </div>
              <span className="text-[12px] text-muted-foreground/50">
                {doc.file_url?.split('.').pop()?.toUpperCase() || "FILE"}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          <DialogHeader className="p-0">
            <DialogTitle className="text-[15px] font-semibold">{doc.document_name}</DialogTitle>
          </DialogHeader>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${statusConfig.bg} ${statusConfig.color}`}>
              <StatusIcon size={12} />
              {statusConfig.label}
            </span>
          </div>

          {/* AI Status */}
          {aiStatus && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/[0.04] border border-primary/[0.08]">
              <Sparkles size={12} className="text-primary/60" />
              <span className="text-[11px] text-primary/70">{aiStatus}</span>
            </div>
          )}

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
            {doc.file_url && (
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] border-white/[0.08] bg-transparent hover:bg-white/[0.04] flex-1"
                onClick={() => window.open(doc.file_url!, "_blank")}
              >
                Open original
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] border-white/[0.08] bg-transparent hover:bg-white/[0.04] flex-1"
              onClick={() => { onReplace(); onOpenChange(false); }}
            >
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[11px] text-red-400/60 hover:text-red-400 hover:bg-red-500/10 h-8 px-3"
              onClick={() => { onDelete(); onOpenChange(false); }}
            >
              <X size={13} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
