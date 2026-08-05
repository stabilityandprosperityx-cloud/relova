import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_PREFIX = "scroll:";

// Prevent the browser's automatic scroll restoration from fighting our logic
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function saveScroll(key: string, y: number) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(y));
  } catch {
    // sessionStorage may be unavailable (private mode quotas, etc.)
  }
}

function readScroll(key: string): number {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (raw == null) return 0;
    const y = Number(raw);
    return Number.isFinite(y) ? y : 0;
  } catch {
    return 0;
  }
}

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevKeyRef = useRef(location.key);

  // Continuously tracks the current page's scrollY via the scroll listener.
  // This is the source of truth when leaving a route — window.scrollY at
  // layout time may already be clamped to the incoming page's height.
  const scrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;
    const key = location.key;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        scrollYRef.current = window.scrollY;
        saveScroll(key, window.scrollY);
        ticking = false;
      });
    };

    scrollYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      // Never persist scroll here — cleanup runs after the layout effect has
      // already scrolled the new page (often to 0), which would overwrite the
      // real pre-navigation position with a clamped/zeroed value.
      window.removeEventListener("scroll", onScroll);
    };
  }, [location.key]);

  useLayoutEffect(() => {
    const prevKey = prevKeyRef.current;

    // Persist the page we're leaving using scrollYRef only — never window.scrollY
    // at this point, which may already reflect the new (shorter) page.
    if (prevKey !== location.key) {
      saveScroll(prevKey, scrollYRef.current);
    }

    const y = navigationType === "POP" ? readScroll(location.key) : 0;
    window.scrollTo(0, y);
    scrollYRef.current = window.scrollY;
    prevKeyRef.current = location.key;
  }, [location.key, navigationType]);

  // Second pass after paint in case layout height settles after first restore
  useEffect(() => {
    const y = navigationType === "POP" ? readScroll(location.key) : 0;
    const id = requestAnimationFrame(() => {
      window.scrollTo(0, y);
      scrollYRef.current = window.scrollY;
    });
    return () => cancelAnimationFrame(id);
  }, [location.key, navigationType]);

  return null;
}
