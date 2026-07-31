import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import portugalCity from "@/assets/redesign/portugal-city.jpg";
import spainCity from "@/assets/redesign/spain-city.jpg";
import greeceIslands from "@/assets/redesign/greece-islands.jpg";
import mexicoCoast from "@/assets/redesign/mexico-coast.jpg";
import thailandTemples from "@/assets/redesign/thailand-temples.jpg";
import malaysiaCity from "@/assets/redesign/malaysia-city.jpg";

const COUNTRIES = [
  {
    flag: "🇵🇹", name: "Portugal", slug: "portugal",
    costRange: "$1,000 – $1,400", topVisa: "D7 Visa",
    imgSrc: portugalCity, imgAlt: "Historic Lisbon cityscape with colourful buildings and trams",
  },
  {
    flag: "🇪🇸", name: "Spain", slug: "spain",
    costRange: "$1,200 – $1,700", topVisa: "Non-Lucrative Visa",
    imgSrc: spainCity, imgAlt: "Vibrant Spanish city street lined with cafes and architecture",
  },
  {
    flag: "🇬🇷", name: "Greece", slug: "greece",
    costRange: "$900 – $1,400", topVisa: "Greece Digital Nomad Visa",
    imgSrc: greeceIslands, imgAlt: "White-washed buildings and blue domes overlooking the Aegean Sea in Greece",
  },
  {
    flag: "🇲🇽", name: "Mexico", slug: "mexico",
    costRange: "$800 – $1,300", topVisa: "Temporary Resident Visa",
    imgSrc: mexicoCoast, imgAlt: "Scenic Mexican coastline with turquoise water and beach",
  },
  {
    flag: "🇹🇭", name: "Thailand", slug: "thailand",
    costRange: "$900 – $1,500", topVisa: "Thailand LTR Visa",
    imgSrc: thailandTemples, imgAlt: "Golden Buddhist temple surrounded by lush greenery in Thailand",
  },
  {
    flag: "🇲🇾", name: "Malaysia", slug: "malaysia",
    costRange: "$1,200 – $1,800", topVisa: "MM2H Program",
    imgSrc: malaysiaCity, imgAlt: "Modern Kuala Lumpur skyline with the Petronas Twin Towers",
  },
];

export default function CountriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  };

  return (
    <section className="py-20 md:py-28 bg-background border-t border-border/50">
      <div className="container max-w-6xl px-5 md:px-8">

        {/* Header row */}
        <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-4">
              Popular Destinations
            </p>
            <h2 className="font-serif text-[2rem] sm:text-[2.4rem] md:text-[2.8rem] font-semibold leading-[1.08] text-foreground">
              Explore top countries<br />for a better life.
            </h2>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 pb-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              to="/countries"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-primary hover:opacity-75 transition-opacity"
            >
              View all countries <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            {/* Scroll arrows */}
            <div className="hidden md:flex items-center gap-2 ml-4">
              <button
                onClick={() => scroll("left")}
                className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ChevronLeft size={15} className="text-foreground" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ChevronRight size={15} className="text-foreground" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scrollable cards row */}
        <motion.div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 -mx-5 px-5 md:-mx-8 md:px-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {COUNTRIES.map((c, i) => (
            <Link
              key={c.slug}
              to={`/countries/${c.slug}`}
              className="flex-shrink-0 w-[200px] rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              {/* Photo */}
              <div className="w-full" style={{ height: 140 }}>
                <img loading="lazy"
                  src={c.imgSrc}
                  alt={c.imgAlt}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Info */}
              <div className="p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[16px]">{c.flag}</span>
                  <span className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">
                    {c.name}
                  </span>
                </div>
                <div className="space-y-1">
                  <div>
                    <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">
                      Est. monthly cost
                    </p>
                    <p className="text-[11px] font-semibold text-foreground">{c.costRange}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">
                      Top visa
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{c.topVisa}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
