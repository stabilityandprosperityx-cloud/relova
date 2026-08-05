import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { DocumentsPopularLinks } from "@/components/tools/DocumentsPopularLinks";

export default function DocumentsNeededHub() {
  const navigate = useNavigate();
  const [citizenship, setCitizenship] = useState("");
  const [destination, setDestination] = useState("");

  const canCheck = !!citizenship && !!destination && citizenship !== destination;

  const handleCheck = () => {
    if (!canCheck) return;
    navigate(`/tools/documents-needed/${slugify(citizenship)}/${slugify(destination)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>What documents do I need to move abroad? — Relova</title>
        <meta
          name="description"
          content="Free document checklist for relocating abroad — passport, visa, and residence requirements by citizenship and destination."
        />
      </Helmet>
      <Navbar />
      <main className="pt-28 pb-20 px-5">
        <div className="max-w-lg mx-auto">
          <h1 className="font-serif text-[1.75rem] sm:text-[2.2rem] font-semibold text-foreground tracking-tight leading-[1.15] text-center mb-3">
            What documents do I need to move abroad?
          </h1>
          <p className="text-[14px] text-muted-foreground text-center mb-10 leading-relaxed">
            Pick your citizenship and destination. We&apos;ll show a cached checklist of typical
            documents — then you can track them in a free Relova plan.
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
              See document checklist
            </Button>
          </div>

          <p className="text-[12px] text-muted-foreground text-center mt-8 leading-relaxed">
            <DocumentsPopularLinks limit={5} />
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
