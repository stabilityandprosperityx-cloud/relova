import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const countries = [
  { name: "Portugal", slug: "portugal" },
  { name: "Spain", slug: "spain" },
  { name: "UAE", slug: "uae" },
  { name: "USA", slug: "usa" },
  { name: "Canada", slug: "canada" },
  { name: "Germany", slug: "germany" },
  { name: "Thailand", slug: "thailand" },
  { name: "Mexico", slug: "mexico" },
  { name: "Estonia", slug: "estonia" },
  { name: "Indonesia", slug: "indonesia" },
  { name: "Singapore", slug: "singapore" },
  { name: "Argentina", slug: "argentina" },
];

export default function CountriesSection() {
  return (
    <section className="py-24 md:py-32 border-t border-border">
      <div className="container">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[13px] text-muted-foreground mb-4 uppercase tracking-wider font-medium">Coverage</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Move anywhere
          </h2>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
