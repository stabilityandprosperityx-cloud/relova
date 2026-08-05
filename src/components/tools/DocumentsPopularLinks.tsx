import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/toolSlugs";
import {
  DOCUMENTS_LAUNCH_PAIRS,
  pickDiversePopularPairs,
  shortCitizenshipLabel,
  type DocumentsLaunchPair,
} from "@/lib/documentsNeededPairs";

type PopularPair = Pick<DocumentsLaunchPair, "citizenship" | "destination">;

/**
 * Popular document-checklist links: one destination per citizenship from live cache,
 * with a diverse offline fallback so Russia never dominates the first N links.
 */
export function DocumentsPopularLinks({ limit = 5 }: { limit?: number }) {
  const [pairs, setPairs] = useState<PopularPair[]>(() =>
    pickDiversePopularPairs(DOCUMENTS_LAUNCH_PAIRS, limit),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-cached-document-checklist", {
          body: { list_popular: true, limit },
        });
        if (cancelled || error) return;
        const remote = Array.isArray(data?.pairs) ? data.pairs : [];
        const mapped: PopularPair[] = remote
          .filter(
            (p: { citizenship?: string; destination?: string }) =>
              typeof p?.citizenship === "string" && typeof p?.destination === "string",
          )
          .map((p: { citizenship: string; destination: string }) => ({
            citizenship: p.citizenship,
            destination: p.destination,
          }));
        if (mapped.length > 0) setPairs(mapped.slice(0, limit));
      } catch {
        /* keep offline diverse fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (pairs.length === 0) return null;

  return (
    <>
      Popular:{" "}
      {pairs.map((pair, i) => (
        <span key={`${pair.citizenship}-${pair.destination}`}>
          {i > 0 && ", "}
          <Link
            to={`/tools/documents-needed/${slugify(pair.citizenship)}/${slugify(pair.destination)}`}
            className="text-primary hover:underline"
          >
            {shortCitizenshipLabel(pair.citizenship)} → {pair.destination}
          </Link>
        </span>
      ))}
    </>
  );
}
