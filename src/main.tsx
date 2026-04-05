import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import ReactGA from "react-ga4";
import App from "./App.tsx";
import "./index.css";
import { initPaddle } from "./config/paddle";

ReactGA.initialize("REPLACE_WITH_GA4_ID");

// Initialize Paddle once DOM is ready
if (document.readyState === "complete") {
  initPaddle();
} else {
  window.addEventListener("load", initPaddle);
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
