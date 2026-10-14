import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Service Worker for Windows PWA and Offline Support
if ("serviceWorker" in navigator && process.env.NODE_ENV !== "test") {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("PC Desktop Suite Service Worker registered successfully, scope:", reg.scope);
      })
      .catch((err) => {
        console.warn("Service Worker registration failed:", err);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
