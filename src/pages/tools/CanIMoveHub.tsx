import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIZENSHIP_NAMES, DESTINATION_NAMES, slugify } from "@/lib/toolSlugs";
import {
  CAN_I_MOVE_LAUNCH_PAIRS,
  canIMovePath,
  groupByCitizenship,
  shortCitizenshipLabel,
} from "@/lib/canIMovePairs";

const GROUPED_PAIRS = groupByCitizenship(CAN_I_MOVE_LAUNCH_PAIRS);

export default function CanIMoveHub() {
  const navigate = useNavigate();
  const [citizenship, setCitizenship] = useState("");
  const [destination, setDestination] = useState("");

  const canCheck = !!citizenship && !!destination && citizenship !== destination;

  const handleCheck = () => {
    if (!canCheck) return;
    navigate(`/tools/can-i-move/${slugify(citizenship)}/${slugify(destination)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Can I move to another country with my passport? — Relova</title>
        <meta
          name="description"
          content="Free passport check: see whether relocating to a destination is often feasible for your citizenship — then get a personalized plan."
        />
      </Helmet>
      <Navbar />
      <main className="pt-28 pb-20 px-5">
        <div className="max-w-lg mx-auto">
          <h1 className="font-serif text-[1.75rem] sm:text-[2.2rem] font-semibold text-foreground tracking-tight leading-[1.15] text-center mb-3">
            Can I move to another country with my passport?
          </h1>
          <p className="text-[14px] text-muted-foreground text-center mb-10 leading-relaxed">
            Pick your citizenship and where you want to go. We&apos;ll give you a quick, honest signal —
            then you can build a full plan if it looks promising.
          </p>

          <div className="surface-card p-6 sm:p-8 space-y-5">
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-muted-foreground">Your citizenship</label>
              <Select value={citizenship} onValueChange={setCitizenship}>
                <SelectTrigger className="w-full form-field h-11">
                  <SelectValue placeholder="Select citizenship" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {CITIZENSHIP_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-medium text-muted-foreground">Where you want to go</label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger className="w-full form-field h-11">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {DESTINATION_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full h-11" disabled={!canCheck} onClick={handleCheck}>
              Check
            </Button>
          </div>

          <div className="mt-12">
            <h2 className="text-[13px] font-medium text-muted-foreground text-center mb-5">
              {CAN_I_MOVE_LAUNCH_PAIRS.length} cached checks, by citizenship
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {GROUPED_PAIRS.map((group) => (
                <div key={group.citizenship} className="surface-card p-4">
                  <p className="text-[12px] font-semibold text-foreground mb-2">
                    {shortCitizenshipLabel(group.citizenship)} passport
                  </p>
                  <p className="text-[13px] leading-relaxed">
                    {group.destinations.map((destination, i) => (
                      <span key={destination}>
                        {i > 0 && " · "}
                        <Link
                          to={canIMovePath(group.citizenship, destination)}
                          className="text-primary hover:underline"
                        >
                          {destination}
                        </Link>
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
