import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import type { UserProfile } from "@/pages/Dashboard";

type Message = { role: "user" | "assistant"; content: string };

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history
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
        const greeting = `Welcome back! You're working on your ${profile.visa_type?.replace("_", " ")} visa for ${profile.target_country}. I have your full profile — just ask me anything about your next steps.`;
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
    if (!text.trim() || isLoading || !user) return;
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
        tier: "pro",
        systemContext: buildSystemContext(),
        onDelta: upsertAssistant,
        onDone: async () => {
          setIsLoading(false);
          if (assistantSoFar) {
            await saveMessage({ role: "assistant", content: assistantSoFar });
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold tracking-tight mb-4">AI Chat</h1>

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
              <div className={`max-w-[85%] rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#38BDF8] text-white"
                  : "bg-white/[0.04] border border-white/[0.06]"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:text-[#9CA3AF] [&_li]:text-[#9CA3AF] [&_strong]:text-foreground [&_p]:text-[13px] [&_li]:text-[13px]">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]/40 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]/40 animate-pulse [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]/40 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="pt-4 border-t border-white/[0.06] mt-4">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your relocation..."
            className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] placeholder:text-[#9CA3AF]/40 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="h-11 w-11 rounded-xl shrink-0 bg-[#38BDF8] hover:bg-[#38BDF8]/80" disabled={!input.trim() || isLoading}>
            <Send size={14} />
          </Button>
        </form>
        <p className="text-[10px] text-[#9CA3AF]/40 text-center mt-2">
          Relova provides guidance, not legal advice.
        </p>
      </div>
    </div>
  );
}
