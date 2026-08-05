import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_PREFIX = "scroll:";
const LOG = "[ScrollToTop]";

// Prevent the browser's automatic scroll restoration from fighting our logic
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function saveScroll(key: string, y: number, reason: string) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(y));
    console.log(LOG, "SAVE", { reason, key, y, storageKey: STORAGE_PREFIX + key });
  } catch (err) {
    console.warn(LOG, "SAVE failed", { reason, key, y, err });
  }
}

function readScroll(key: string): number {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (raw == null) {
      console.log(LOG, "READ miss", { key, storageKey: STORAGE_PREFIX + key });
      return 0;
    }
    const y = Number(raw);
    const value = Number.isFinite(y) ? y : 0;
    console.log(LOG, "READ", { key, raw, value, storageKey: STORAGE_PREFIX + key });
    return value;
  } catch (err) {
    console.warn(LOG, "READ failed", { key, err });
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
        saveScroll(location.key, window.scrollY, "throttled-scroll-listener");
        ticking = false;
      });
    };

    scrollYRef.current = window.scrollY;
    console.log(LOG, "scroll-listener attached", {
      key: location.key,
      pathname: location.pathname,
      scrollY: window.scrollY,
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      const yAtCleanup = window.scrollY;
      console.log(LOG, "scroll-listener CLEANUP (about to save)", {
        key: location.key,
        pathname: location.pathname,
        scrollYAtCleanup: yAtCleanup,
        scrollYRef: scrollYRef.current,
        note: "If layout effect already scrolled to 0, this may overwrite a good save with 0",
      });
      window.removeEventListener("scroll", onScroll);
      saveScroll(location.key, window.scrollY, "scroll-listener-cleanup");
    };
  }, [location.key, location.pathname]);

  useLayoutEffect(() => {
    const prevKey = prevKeyRef.current;
    const scrollYBefore = window.scrollY;
    const docHeightBefore = document.documentElement.scrollHeight;
    const viewportH = window.innerHeight;

    console.log(LOG, "ROUTE CHANGE (useLayoutEffect)", {
      navigationType,
      pathname: location.pathname,
      locationKey: location.key,
      prevKey,
      keysMatch: prevKey === location.key,
      scrollYBefore,
      scrollYRef: scrollYRef.current,
      docHeightBefore,
      viewportH,
      maxScrollable: Math.max(0, docHeightBefore - viewportH),
    });

    // With history.scrollRestoration = "manual", window.scrollY is still the
    // previous page's position when this runs — persist it before we move.
    if (prevKey !== location.key) {
      const yToSave = window.scrollY || scrollYRef.current;
      saveScroll(prevKey, yToSave, "layout-before-nav-away");
    }

    const y = navigationType === "POP" ? readScroll(location.key) : 0;
    console.log(LOG, "RESTORE attempt", {
      navigationType,
      action: navigationType === "POP" ? "restore" : "scroll-to-top",
      locationKey: location.key,
      targetY: y,
      scrollYBeforeRestore: window.scrollY,
      docHeight: document.documentElement.scrollHeight,
      maxScrollable: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
      willClamp:
        y > Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
    });

    window.scrollTo(0, y);
    console.log(LOG, "RESTORE after scrollTo", {
      requestedY: y,
      actualScrollY: window.scrollY,
      clamped: window.scrollY !== y,
      docHeight: document.documentElement.scrollHeight,
    });

    scrollYRef.current = y;
    prevKeyRef.current = location.key;
  }, [location.key, location.pathname, navigationType]);

  // Second pass after paint to beat any async layout that shifts scroll
  useEffect(() => {
    const y = navigationType === "POP" ? readScroll(location.key) : 0;
    const id = requestAnimationFrame(() => {
      console.log(LOG, "rAF second pass BEFORE", {
        navigationType,
        locationKey: location.key,
        targetY: y,
        scrollY: window.scrollY,
        docHeight: document.documentElement.scrollHeight,
        maxScrollable: Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight,
        ),
      });
      window.scrollTo(0, y);
      console.log(LOG, "rAF second pass AFTER", {
        requestedY: y,
        actualScrollY: window.scrollY,
        clamped: window.scrollY !== y,
        docHeight: document.documentElement.scrollHeight,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [location.key, navigationType]);

  // Watch for anything else resetting scroll after our restore (diagnostic only)
  useEffect(() => {
    if (navigationType !== "POP") return;
    const expected = readScroll(location.key);
    const checks = [50, 150, 300, 600, 1000].map((ms) =>
      window.setTimeout(() => {
        console.log(LOG, `POST-RESTORE check @${ms}ms`, {
          locationKey: location.key,
          expectedY: expected,
          actualScrollY: window.scrollY,
          docHeight: document.documentElement.scrollHeight,
          maxScrollable: Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight,
          ),
          drifted: window.scrollY !== expected && Math.abs(window.scrollY - expected) > 2,
        });
      }, ms),
    );
    return () => checks.forEach(clearTimeout);
  }, [location.key, navigationType]);

  return null;
}
