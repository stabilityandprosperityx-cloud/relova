import { motion } from "framer-motion";
import { CalendarDays, Check, FileText, FolderLock, Sparkles, Route, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardTab, UserProfile } from "@/pages/Dashboard";
import type { RelocationCase } from "@/hooks/useRelocationCase";

interface Props {
  profile: UserProfile | null;
  onNavigate: (tab: DashboardTab) => void;
  onEditProfile: () => void;
  relocationCase: RelocationCase;
}

const countryImages: Record<string, string> = {
  Portugal: "/assets/portugal-street.jpg",
  Spain: "/assets/spain-city.jpg",
  Canada: "/assets/canada-vancouver.jpg",
  Germany: "/assets/germany-berlin.jpg",
  "United States": "/assets/usa-new-york.jpg",
  Australia: "/assets/australia-harbour.jpg",
  "United Arab Emirates": "/assets/uae-city.jpg",
};

function formatMoveDate(value: string | null | undefined) {
  if (!value) return "Date not set";
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(value));
}

export default function DashboardOverview({ profile, onNavigate, onEditProfile, relocationCase }: Props) {
  if (relocationCase.loading) return <div className="space-y-5"><Skeleton className="h-80 rounded-[28px]"/><div className="grid gap-5 md:grid-cols-3"><Skeleton className="h-48"/><Skeleton className="h-48"/><Skeleton className="h-48"/></div></div>;
  if (!profile) return <section className="relova-workspace-empty"><Sparkles/><h2>Let’s create your relocation workspace.</h2><p>Complete your profile to receive a personal plan, documents and country guidance.</p><button onClick={onEditProfile}>Set up my profile</button></section>;

  const country = profile.target_country || profile.recommended_country || "your destination";
  const image = countryImages[country] || "/assets/passage.jpg";
  const progress = relocationCase.progressPct;
  const done = relocationCase.doneCount;
  const total = relocationCase.totalCount || 7;
  const nextTitle = relocationCase.nextStep?.title || "Review your relocation plan";
  const documentState = profile.documents_status === "ready" ? "Vault ready" : profile.documents_status === "generating" ? "Preparing vault" : "Documents to review";

  return (
    <div className="relova-workspace-overview">
      <section className="relova-journey-hero">
        <img src={image} alt={`${country} relocation destination`} />
        <div className="relova-journey-shade" />
        <div className="relova-journey-copy">
          <span>Your relocation workspace</span>
          <h1>Your move to<br/>{country}</h1>
          <button className="relova-move-date" onClick={onEditProfile}><CalendarDays size={14}/>{formatMoveDate(profile.move_date)}</button>
        </div>
        <div className="relova-readiness-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}>
          <div><strong>{progress}%</strong><span>readiness</span></div>
        </div>
      </section>

      <motion.section className="relova-next-action" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relova-action-icon"><FileText size={27}/><i/></div>
        <div className="relova-action-copy"><span>Your next best action</span><h2>{nextTitle}</h2>{relocationCase.nextStep?.description && <p>{relocationCase.nextStep.description}</p>}</div>
        <div className="relova-action-buttons">
          {relocationCase.nextStep && <button className="relova-primary-action" onClick={() => relocationCase.markStepDone(relocationCase.nextStep!.id)}><Check size={16}/> Mark as done</button>}
          <button className="relova-secondary-action" onClick={() => onNavigate("chat")}>Ask my advisor</button>
        </div>
      </motion.section>

      <div className="relova-workspace-grid">
        <button className="relova-workspace-card" onClick={() => onNavigate("plan")}>
          <div className="relova-card-icon"><Route size={22}/></div><span>Relocation plan</span><h3>Next steps</h3><p>{done} of {total} complete</p>
          <div className="relova-card-progress"><i style={{ width: `${progress}%` }}/></div><small>{relocationCase.currentPhase}</small>
        </button>
        <button className="relova-workspace-card" onClick={() => onNavigate("documents")}>
          <div className="relova-card-icon"><FolderLock size={22}/></div><span>Secure vault</span><h3>Documents</h3><p>{documentState}</p>
          <div className="relova-document-lines"><i/><i/><i/></div><small>Organized for your visa path</small>
        </button>
        <button className="relova-workspace-card" onClick={() => onNavigate("countries")}>
          <div className="relova-card-icon"><ShieldCheck size={22}/></div><span>Relova insight</span><h3>Relocation readiness</h3><p>{progress < 35 ? "Building your foundation" : progress < 75 ? "Making confident progress" : "Nearly ready to move"}</p>
          <div className="relova-card-progress premium"><i style={{ width: `${Math.max(progress, 8)}%` }}/></div><small>{relocationCase.daysUntilMove !== null ? `${relocationCase.daysUntilMove} days until your move` : "Set your move date"}</small>
        </button>
      </div>

      <section className="relova-advisor-strip">
        <div className="relova-advisor-orb"><img src="/assets/relova-mark.png" alt=""/></div>
        <div><span>Relova Advisor</span><h3>Your plan is already part of the conversation.</h3><p>Ask a question and receive guidance based on your destination, progress and documents.</p></div>
        <button onClick={() => onNavigate("chat")}>Open Advisor</button>
      </section>
    </div>
  );
}
