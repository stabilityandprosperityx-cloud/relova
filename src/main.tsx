import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPaddle } from "./config/paddle";

// Initialize Paddle once DOM is ready
if (document.readyState === "complete") {
  initPaddle();
} else {
  window.addEventListener("load", initPaddle);
}

createRoot(document.getElementById("root")!).render(<App />);
