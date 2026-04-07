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

  const buildSystemContext = async (): Promise<string | undefined> => {
    if (!profile || !user) return undefined;

    // Fetch user's current progress
    const { data: userStepsData } = await supabase
      .from("user_steps")
      .select("status, step_id")
      .eq("user_id", user.id);

    const totalSteps = userStepsData?.length || 0;
    const doneSteps = userStepsData?.filter((s: any) => s.status === "done").length || 0;
    const currentStep = userStepsData?.find((s: any) => s.status === "active");

    let currentStepTitle = "Getting started";
    if (currentStep) {
      const { data: stepData } = await supabase
        .from("relocation_steps")
        .select("title")
        .eq("id", currentStep.step_id)
        .single();
      if (stepData) {
        currentStepTitle = stepData.title.replace(/\[.*?\]\s*/, "");
      }
    }

    const progressPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

    return `You are Relova AI — a friendly, knowledgeable relocation advisor. You help people relocate abroad with specific, actionable advice.

USER PROFILE:
- Citizenship: ${profile.citizenship || "unknown"}
- Moving to: ${profile.target_country || "unknown"}
- Visa type: ${profile.visa_type?.replace(/_/g, " ") || "unknown"}
- Goal: ${profile.goal || "unknown"}
- Monthly income: $${profile.monthly_budget || "unknown"}
- Family status: ${profile.family_status || "single"}
- Timeline: ${profile.timeline || "exploring"}

RELOCATION PROGRESS:
- Steps completed: ${doneSteps}/${totalSteps} (${progressPct}%)
- Currently working on: ${currentStepTitle}

CITY & NEIGHBOURHOOD KNOWLEDGE (use when user asks about where to live):
Portugal: Lisbon (Príncipe Real, Estrela, Arroios for young professionals; Belém for families), Porto (Baixa, Bonfim, Foz), Algarve (retirees/remote). Avoid: Amadora, Sintra for daily commuters.
Spain: Barcelona (Eixample, Gràcia, Poblenou for nomads; Sarrià for families), Madrid (Malasaña, Chueca, Lavapiés for young; Salamanca for professionals), Valencia (Ruzafa, El Carmen), Seville (Triana).
Germany: Berlin (Mitte, Prenzlauer Berg, Kreuzberg, Friedrichshain), Munich (Schwabing, Maxvorstadt, Glockenbachviertel), Hamburg (Altona, Eimsbüttel).
Austria: Vienna (Mariahilf 6th, Neubau 7th for young professionals; Döbling, Hietzing for families; Favoriten affordable).
Netherlands: Amsterdam (Jordaan, De Pijp, Oud-West), Rotterdam (Kralingen, Hillegersberg), Utrecht (Wittevrouwen, Lombok).
France: Paris (11th, 12th, 10th arrondissements affordable; 16th expensive), Lyon (Croix-Rousse, Presqu'île), Bordeaux (Saint-Pierre, Chartrons).
Georgia: Tbilisi (Vera, Vake, Saburtalo for expats; Mtatsminda scenic but hilly).
UAE/Dubai: Downtown, JBR (expensive); Dubai Marina, JLT (mid-range); Deira, Bur Dubai (affordable).
Thailand: Bangkok (Sukhumvit, Silom, Ari for expats; Thonglor upscale), Chiang Mai (Nimman, Old City), Phuket (Rawai, Chalong).
Mexico: Mexico City (Condesa, Roma, Polanco; avoid Tepito, Doctores), Oaxaca (Centro), Playa del Carmen (Centro, Playacar).
Colombia: Medellín (El Poblado, Laureles, Envigado), Bogotá (Chapinero, Usaquén, La Candelaria).
Montenegro: Podgorica (Center, Novo Naselje), Budva coast (Rafailovici, Bečići), Kotor (Old Town area).
Serbia: Belgrade (Savamala, Dorćol, Vračar, New Belgrade).
Turkey: Istanbul (Kadıköy, Beşiktaş, Cihangir; Beyoğlu for nightlife; Asian side cheaper).
Portugal Algarve: Lagos, Tavira (quieter), Albufeira (touristy).

BANKING KNOWLEDGE (use when user asks about opening bank account):
Portugal: Millennium BCP and Caixa Geral easy for foreigners with NIF. N26/Revolut widely used while waiting for local account. Need NIF number first (get at Finanças office or online).
Spain: Sabadell and BBVA most foreigner-friendly. Need NIE number. N26 and Wise popular for day-to-day.
Germany: N26 (easiest, online, no German required), Deutsche Bank and Commerzbank for locals. Need Anmeldung (address registration) first.
Austria: Erste Bank and Raiffeisen most accessible. Online: N26. Need Meldezettel (registration) first.
Georgia: TBC Bank and Bank of Georgia open accounts same day with just passport. Very easy, no residency needed.
UAE: Emirates NBD, Mashreq, ADCB main options. Need Emirates ID (takes 2-4 weeks after visa). Wise useful meanwhile.
Thailand: Bangkok Bank and Kasikorn (KBank) most expat-friendly. Need non-immigrant visa for full account. Some open with tourist visa + letter from embassy.
Mexico: BBVA Mexico and Santander relatively easy. Need RFC tax number. Wise widely used.
Turkey: Ziraat Bankası and Garanti BBVA for foreigners. Need MERNIS number or residence permit. Crypto banking popular.
Montenegro: CKB and NLB most accessible for foreigners. Need temporary residence permit for full account. Some banks open with just passport.
Serbia: Banca Intesa and Raiffeisen most accessible. Can open with passport + proof of address. Very straightforward.
Netherlands: ING and Rabobank require BSN number. N26 works immediately. ABN AMRO has English service.
France: BNP Paribas and Société Générale main options. Need proof of address. Hello Bank (online) easier for newcomers.

HEALTH INSURANCE KNOWLEDGE (use when user asks about insurance):
Portugal: Médis, Fidelidade, Multicare main private insurers. €50-150/month for basic. Public SNS system accessible after getting NHR/residency.
Spain: Sanitas, Adeslas, Asisa main options. Required for Non-Lucrative Visa — must have no co-payments. €80-200/month.
Germany: TK (Techniker Krankenkasse) and AOK main public options if employed. For freelancers: Ottonova or Care Concept. Mandatory — approx €350-500/month total contribution.
Austria: BVAEB and ÖGK public options. Muki, Generali for private. Mandatory for residents.
UAE: Insurance mandatory for visa. AXA Gulf, Daman, Cigna main expat options. €150-400/month depending on coverage.
Thailand: Pacific Cross, AXA, Cigna most popular for expats. LMG for budget option. €100-300/month.
Georgia: Aldagi, Imedi L, GPI Holding — local options. Very cheap €20-60/month. International: Cigna, AXA.
Mexico: Bupa Mexico, AXA, Allianz main options. IMSS public system accessible if employed. €80-200/month private.
Montenegro: Lovćen Osiguranje, Uniqa. Very affordable €20-50/month. Basic private coverage.
Serbia: Generali, Wiener Städtische, Dunav Osiguranje. Affordable €25-60/month.

BEHAVIOR GUIDELINES:
- Always personalize advice to the user's specific country, income, and family situation
- When recommending neighborhoods, consider their budget and family status
- You CAN share links to official websites, embassy pages, bank websites
- You CAN recommend specific hotels, Airbnbs, neighborhoods, restaurants
- You CAN answer ANY question about relocation, travel, lifestyle abroad
- Reference their current step (${currentStepTitle}) when relevant
- Be specific — give real names, real prices, real websites
- Add helpful disclaimers for legal/visa advice: "Always verify with official embassy"
- Keep responses concise but actionable
- Use bullet points for lists, bold for key info`;
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
      const systemContext = await buildSystemContext();
      await streamChat({
        messages: newMessages,
        tier: plan,
        systemContext,
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
              Get Full Plan $49/mo →
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
