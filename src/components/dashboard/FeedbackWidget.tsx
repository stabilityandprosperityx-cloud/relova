import { useState } from "react";
import { MessageSquare, X, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const TELEGRAM_BOT_TOKEN = "8670604565:AAGsWUyWj7iSWNbuoDPi6NxDyfIjYhDsL6w";
const TELEGRAM_CHAT_ID = "979688838";

export default function FeedbackWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const sendFeedback = async () => {
    if (!message.trim()) return;
    setStatus("sending");

    const text = `💬 *New Relova Feedback*\n\n${message}\n\n👤 User: ${user?.email || "anonymous"}\n🕐 ${new Date().toLocaleString("en-GB", { timeZone: "UTC" })} UTC`;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text,
            parse_mode: "Markdown",
          }),
        }
      );
      if (!response.ok) throw new Error("Failed");
      setStatus("sent");
      setTimeout(() => {
        setIsOpen(false);
        setMessage("");
        setStatus("idle");
      }, 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2.5 rounded-full bg-[#1a1a1a] border border-white/[0.08] text-[12px] text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-all shadow-lg md:bottom-6 bottom-20"
      >
        <MessageSquare size={14} />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-5">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl p-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-semibold">Send feedback</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  What can we improve?
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            {status === "sent" ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <CheckCircle size={32} className="text-green-400" />
                <p className="text-sm font-medium">Thank you for your feedback!</p>
              </div>
            ) : (
              <>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think, what's missing, or what's broken..."
                  rows={4}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none mb-3"
                />
                {status === "error" && (
                  <p className="text-[12px] text-destructive mb-3">
                    Failed to send. Please try again.
                  </p>
                )}
                <Button
                  onClick={sendFeedback}
                  disabled={!message.trim() || status === "sending"}
                  className="w-full h-10 text-sm"
                >
                  <Send size={14} className="mr-2" />
                  {status === "sending" ? "Sending..." : "Send feedback"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
