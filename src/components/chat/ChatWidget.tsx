import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import InlineUpsell from "@/components/chat/InlineUpsell";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

type Message = { role: "user" | "assistant"; content: string };

const FREE_LIMIT = 3;
const ANON_LIMIT = 1;
const STORAGE_KEY = "relova_questions_used";

function getQuestionsUsed(): number {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
  } catch { return 0; }
}

function incrementQuestionsUsed(): number {
  const next = getQuestionsUsed() + 1;
  localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  tier,
  onDelta,
  onDone,
}: {
  messages: Message[];
  tier: string;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, tier }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    if (resp.status === 429) throw new Error("Rate limit exceeded. Please wait a moment.");
    if (resp.status === 402) throw new Error("AI credits exhausted. Please add funds.");
    throw new Error(errorData.error || "Failed to get response");
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }
  onDone();
}

interface ChatWidgetProps {
  compact?: boolean;
  maxHeight?: string;
  suggestedPrompts?: string[];
}

export default function ChatWidget({ compact = false, maxHeight = "400px", suggestedPrompts }: ChatWidgetProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Where are you currently based, and where are you thinking of moving? Tell me your situation and I'll find your best path." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(getQuestionsUsed);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isAnon = !user;
  const anonLimitReached = isAnon && questionsUsed >= ANON_LIMIT;
  const freeLimitReached = !isAnon && questionsUsed >= FREE_LIMIT;
  const isLimited = anonLimitReached || freeLimitReached;
  const tier = "free";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading || isLimited) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMessages,
        tier,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => {
          setIsLoading(false);
          const used = incrementQuestionsUsed();
          setQuestionsUsed(used);
        },
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const defaultPrompts = [
    "How do I get residency in Portugal?",
    "Best country for remote workers?",
    "Compare UAE vs Portugal",
  ];

  const prompts = suggestedPrompts || defaultPrompts;

  return (
    <>
      <div className="flex flex-col rounded-xl border border-border/50 bg-card/80 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
          <span className="text-[11px] text-muted-foreground/50 font-medium">Relova AI</span>
        </div>

        {/* Messages */}
        <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight }}>
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => {
              const isLastAssistant = msg.role === "assistant" && i === messages.length - 1 && !isLoading;
              return (
                <div key={i}>
                  <motion.div
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/30 border border-border/30"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground [&_p]:text-[13px] [&_li]:text-[13px]">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>

                  {isLastAssistant && isAnon && anonLimitReached && (
                    <motion.div
                      className="text-center py-4"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <p className="text-[13px] text-muted-foreground mb-3">Create an account to continue</p>
                      <Button size="sm" onClick={() => setShowAuthModal(true)} className="text-[12px] h-8 px-4">
                        Sign up free
                      </Button>
                    </motion.div>
                  )}

                  {isLastAssistant && !isAnon && tier === "free" && questionsUsed < FREE_LIMIT && (
                    <InlineUpsell questionsUsed={questionsUsed} questionsLimit={FREE_LIMIT} />
                  )}
                </div>
              );
            })}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-muted/30 border border-border/30 rounded-xl px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            </motion.div>
          )}

          {freeLimitReached && !isLoading && (
            <div className="text-center py-3">
              <p className="text-[12px] text-muted-foreground mb-2">
                You've used all {FREE_LIMIT} free questions.{" "}
                <a href="/pricing" className="text-primary hover:underline">Upgrade →</a>
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts when only greeting shown */}
        {messages.length === 1 && messages[0].role === "assistant" && !compact && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {prompts.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="px-2.5 py-1.5 rounded-lg border border-border/40 bg-card/50 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors active:scale-[0.97]"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/40 p-3">
          {isLimited ? (
            <div className="text-center py-1">
              {anonLimitReached ? (
                <button className="text-[12px] text-primary hover:underline" onClick={() => setShowAuthModal(true)}>
                  Sign up to continue →
                </button>
              ) : (
                <a href="/pricing" className="text-[12px] text-primary hover:underline">Upgrade to continue →</a>
              )}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about visas, taxes, documents..."
                className="flex-1 bg-transparent border border-border/40 rounded-lg px-3 py-2 text-[13px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" className="h-9 w-9 rounded-lg shrink-0" disabled={!input.trim() || isLoading}>
                <Send size={14} />
              </Button>
            </form>
          )}
        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        title="Continue your relocation plan"
        subtitle="Create an account to keep going and get personalized answers"
      />
    </>
  );
}
