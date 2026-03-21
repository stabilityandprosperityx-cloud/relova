import Navbar from "@/components/layout/Navbar";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = { role: "user" | "assistant"; content: string };

const suggestedPrompts = [
  "How do I get residency in Portugal?",
  "What documents do I need in Australia?",
  "Compare UAE vs Portugal for a remote worker",
  "What's the cheapest country to live as a nomad?",
];

const mockResponses: Record<string, string> = {
  default: `Great question! Here's what I can help you with:

**Residency & Visas** — I can walk you through visa options for 30+ countries based on your passport, income, and goals.

**Tax Planning** — Understand how your tax obligations change when you relocate, including double taxation treaties.

**Cost of Living** — Get detailed breakdowns of expenses in your target city.

**Document Preparation** — Know exactly what paperwork you need, translated and apostilled.

Ask me anything specific about your relocation!`,
  "how do i get residency in portugal?": `## Portugal Residency Options

Based on the most common pathways:

### 1. D7 Visa (Passive Income)
- **Duration:** 2 years, renewable → permanent residency at 5 years
- **Requirements:** €760/month passive income (pension, dividends, rental)
- **Timeline:** 2-4 months processing
- **Best for:** Retirees, investors with passive income

### 2. Digital Nomad Visa
- **Duration:** 1 year
- **Requirements:** €3,040/month income from remote work
- **Timeline:** 30-60 days
- **Best for:** Remote employees and freelancers

### 3. Golden Visa
- **Duration:** 5 years → citizenship
- **Requirements:** €500k+ fund investment
- **Timeline:** 6-8 months
- **Best for:** Investors seeking EU citizenship

### Next Steps
1. Determine your income type (passive vs. active)
2. Gather apostilled documents
3. Apply for NIF (Portuguese tax number)

Would you like me to create a personalized checklist for your situation?`,
  "what documents do i need in georgia?": `## Documents for Georgia Relocation

Georgia is one of the easiest countries to relocate to. Here's what you need:

### For Entry (Most Nationalities)
- Valid passport (6+ months remaining)
- That's it — **no visa needed** for 1-year stay for 95+ nationalities

### For Long-Term Stay
1. **Passport** — valid for duration of stay
2. **Proof of income** — bank statements or employment contract
3. **Health insurance** — international coverage recommended
4. **Address registration** — register within 10 days of finding housing

### For "Remotely from Georgia" Program
- Proof of $2,000/month income
- Employment/freelance contract
- Passport photos
- Application form (online)

### For Virtual Zone (0% Tax on International Income)
- Company registration documents
- Business plan outline
- Passport copy

### Pro Tips
- Most documents do NOT need apostille for Georgia
- Process is very fast — often same-day
- Bank account can be opened in 30 minutes at BOG or TBC

Want me to create a step-by-step timeline for your move to Georgia?`,
};

function getResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const key of Object.keys(mockResponses)) {
    if (key !== "default" && lower.includes(key.slice(0, 20))) {
      return mockResponses[key];
    }
  }
  return mockResponses.default;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col pt-16">
        {/* Messages area */}
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
                            {msg.content.split("\n").map((line, li) => {
                              if (line.startsWith("## ")) return <h2 key={li}>{line.slice(3)}</h2>;
                              if (line.startsWith("### ")) return <h3 key={li}>{line.slice(4)}</h3>;
                              if (line.startsWith("- **")) {
                                const [bold, rest] = line.slice(4).split("**");
                                return <p key={li}><strong>{bold}</strong>{rest}</p>;
                              }
                              if (line.startsWith("- ")) return <p key={li} className="pl-4">• {line.slice(2)}</p>;
                              if (line.match(/^\d+\.\s/)) return <p key={li} className="pl-4">{line}</p>;
                              if (line.trim() === "") return <br key={li} />;
                              return <p key={li}>{line.replace(/\*\*(.*?)\*\*/g, (_, t) => t)}</p>;
                            })}
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
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

        {/* Input */}
        <div className="border-t border-border bg-background/80 backdrop-blur-xl">
          <div className="container max-w-3xl py-4">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about visas, taxes, housing, documents..."
                className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={isTyping}
              />
              <Button type="submit" size="icon" className="h-11 w-11 rounded-xl shrink-0" disabled={!input.trim() || isTyping}>
                <Send size={16} />
              </Button>
            </form>
            <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
              RelocateAI provides guidance, not legal advice. Always consult a licensed professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
