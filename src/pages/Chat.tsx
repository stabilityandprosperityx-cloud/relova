import Navbar from "@/components/layout/Navbar";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type Message = { role: "user" | "assistant"; content: string };

const suggestedPrompts = [
  "How do I get residency in Portugal?",
  "What documents do I need in Australia?",
  "Compare UAE vs Portugal for a remote worker",
  "What's the cheapest country to live as a nomad?",
  "Best country for tax optimization?",
  "How to get EU citizenship through investment?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
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

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
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
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col pt-16">
        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-3xl py-8">
            {messages.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Sparkles size={22} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">How can I help you relocate?</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Ask me about visas, documents, taxes, cost of living, or anything about moving abroad.
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => send(prompt)}
                      className="px-3.5 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors active:scale-[0.97]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-5 py-4 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm prose-invert max-w-none [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="bg-card border border-border rounded-xl px-5 py-4">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:150ms]" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:300ms]" />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-background/80 backdrop-blur-xl">
          <div className="container max-w-3xl py-4">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about visas, taxes, housing, documents..."
                className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" className="h-11 w-11 rounded-xl shrink-0" disabled={!input.trim() || isLoading}>
                <Send size={16} />
              </Button>
            </form>
            <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
              Relova provides guidance, not legal advice. Always consult a licensed professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
