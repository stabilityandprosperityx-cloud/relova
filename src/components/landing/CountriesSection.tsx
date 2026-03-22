import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const countries = [
  { name: "Portugal", slug: "portugal" },
  { name: "Spain", slug: "spain" },
  { name: "UAE", slug: "uae" },
  { name: "USA", slug: "usa" },
  { name: "Canada", slug: "canada" },
  { name: "Germany", slug: "germany" },
  { name: "Australia", slug: "australia" },
  { name: "Thailand", slug: "thailand" },
  { name: "Mexico", slug: "mexico" },
  { name: "Estonia", slug: "estonia" },
  { name: "Indonesia", slug: "indonesia" },
  { name: "Singapore", slug: "singapore" },
  { name: "Argentina", slug: "argentina" },
];

export default function CountriesSection() {
  return (
    <section className="py-[60px] md:py-[80px] border-t border-border">
      <div className="container">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-[13px] text-muted-foreground mb-4 uppercase tracking-wider font-medium">Coverage</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Plan your move — anywhere in the world
          </h2>
          <p className="text-[15px] text-muted-foreground/70 max-w-[520px] leading-relaxed">
            Relova supports relocation planning for any country — not limited to a few destinations.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          {countries.map((country) => (
            <Link
              key={country.slug}
              to={`/countries/${country.slug}`}
              className="px-5 py-2.5 rounded-lg border border-border text-[14px] text-foreground/80 hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
            >
              {country.name}
            </Link>
          ))}
          <span className="px-5 py-2.5 rounded-lg text-[14px] text-muted-foreground">
            +20 more
          </span>
        </motion.div>
      </div>
    </section>
  );
}
