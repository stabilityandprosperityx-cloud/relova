import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Google Analytics
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });

    // Meta Pixel — SPA navigation doesn't trigger the base code again
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [location.pathname, location.search]);
}
