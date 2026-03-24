import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { UserProfile, UserPlan } from "@/pages/Dashboard";
import ChatActionButtons from "./ChatActionButtons";

type Message = { role: "user" | "assistant"; content: string };

const FREE_LIMIT = 3;
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({ messages, tier, systemContext, onDelta, onDone }: {
  messages: Message[];
  tier: string;
  systemContext?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, tier, systemContext }),
  });
  if (!resp.ok) throw new Error("Failed to get response");
  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {}
    }
  }
  onDone();
}

interface Props {
  profile: UserProfile | null;
}

export default function DashboardChat({ profile }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [questionsUsed, setQuestionsUsed] = useState(profile?.questions_used || 0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const plan: UserPlan = profile?.plan || "free";
  const isFree = plan === "free";
  const limitReached = isFree && questionsUsed >= FREE_LIMIT;
  const remaining = FREE_LIMIT - questionsUsed;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setMessages(data as Message[]);
      } else if (profile) {
        const greeting = profile.target_country
          ? `Your path to ${profile.target_country} is set. Ask me anything about your next steps, visa process, or documents.`
          : `Welcome! Your relocation advisor is ready. Ask me about visas, documents, or your next steps.`;
        setMessages([{ role: "assistant", content: greeting }]);
      }
      setHistoryLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const buildSystemContext = () => {
    if (!profile) return undefined;
    return `You are Relova AI. This user profile:
citizenship: ${profile.citizenship || "unknown"}
target country: ${profile.target_country || "unknown"}
visa type: ${profile.visa_type || "unknown"}
goal: ${profile.goal || "unknown"}
monthly budget: $${profile.monthly_budget || "unknown"}
Tailor ALL advice specifically to their citizenship and visa type. Reference their exact situation. Never give generic answers.`;
  };

  const saveMessage = async (msg: Message) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: msg.role,
      content: msg.content,
    });
  };

  const send = async (text: string) => {
    if (!text.trim() || isLoading || !user || limitReached) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    await saveMessage(userMsg);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length === newMessages.length + 1) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMessages,
        tier: plan,
        systemContext: buildSystemContext(),
        onDelta: upsertAssistant,
        onDone: async () => {
          setIsLoading(false);
          if (assistantSoFar) {
            await saveMessage({ role: "assistant", content: assistantSoFar });
          }
          if (isFree) {
            const newCount = questionsUsed + 1;
            setQuestionsUsed(newCount);
            await supabase
              .from("user_profiles")
              .update({ questions_used: newCount })
              .eq("user_id", user.id);
          }
        },
      });
    } catch (e) {
      setIsLoading(false);
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  if (historyLoading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)]">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-4">Your Relocation Advisor</h1>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={`max-w-[90%] md:max-w-[85%] rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/[0.04] border border-white/[0.06]"
              }`}>
                {msg.role === "assistant" ? (
                  <>
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground [&_p]:text-[13px] [&_li]:text-[13px]">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {!isLoading && (
                      <ChatActionButtons content={msg.content} visaType={profile?.visa_type || null} />
                    )}
                  </>
                ) : msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area — padded on mobile */}
      {limitReached ? (
        <div className="pt-4 border-t border-white/[0.06] mt-4 text-center space-y-3 py-6 px-1">
          <p className="text-[13px] text-muted-foreground">
            You've used all {FREE_LIMIT} free questions. Upgrade to Pro for unlimited answers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="sm"
              className="text-[12px] bg-primary hover:bg-primary/80 h-12 sm:h-auto w-full sm:w-auto"
              onClick={() => navigate("/pricing")}
            >
              Start with Pro $19 →
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-[12px] border-white/[0.08] bg-transparent hover:bg-white/[0.04] h-12 sm:h-auto w-full sm:w-auto"
              onClick={() => navigate("/pricing")}
            >
              Get Full Plan $49 →
            </Button>
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-white/[0.06] mt-4 pb-2">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your relocation..."
              className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3.5 text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" className="h-12 w-12 rounded-xl shrink-0 bg-primary hover:bg-primary/80" disabled={!input.trim() || isLoading}>
              <Send size={14} />
            </Button>
          </form>
          {isFree && remaining > 0 && (
            <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
              {remaining} free question{remaining !== 1 ? "s" : ""} remaining
              {remaining <= 2 && (
                <span className="text-primary/60">
                  {remaining === 2
                    ? " · Pro users get unlimited personalized answers"
                    : " · Upgrade to keep your relocation plan going"}
                </span>
              )}
            </p>
          )}
          {!isFree && (
            <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
              Relova provides guidance, not legal advice.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
