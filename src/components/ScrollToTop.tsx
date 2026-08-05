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

  // Keep a live scroll position so we can persist it even if a scroll event
  // hasn't fired immediately before navigation.
  const scrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        scrollYRef.current = window.scrollY;
        saveScroll(location.key, window.scrollY);
        ticking = false;
      });
    };

    scrollYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      saveScroll(location.key, window.scrollY);
    };
  }, [location.key]);

  useLayoutEffect(() => {
    const prevKey = prevKeyRef.current;

    // With history.scrollRestoration = "manual", window.scrollY is still the
    // previous page's position when this runs — persist it before we move.
    if (prevKey !== location.key) {
      saveScroll(prevKey, window.scrollY || scrollYRef.current);
    }

    const y = navigationType === "POP" ? readScroll(location.key) : 0;
    window.scrollTo(0, y);
    scrollYRef.current = y;
    prevKeyRef.current = location.key;
  }, [location.key, navigationType]);

  // Second pass after paint to beat any async layout that shifts scroll
  useEffect(() => {
    const y = navigationType === "POP" ? readScroll(location.key) : 0;
    const id = requestAnimationFrame(() => window.scrollTo(0, y));
    return () => cancelAnimationFrame(id);
  }, [location.key, navigationType]);

  return null;
}
