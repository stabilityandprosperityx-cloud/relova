import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// Disable browser scroll restoration immediately
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // useLayoutEffect fires before paint — prevents flash at old scroll position
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
