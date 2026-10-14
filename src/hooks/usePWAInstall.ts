import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [isEdge, setIsEdge] = useState(false);
  const [isChrome, setIsChrome] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed on Windows)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: window-controls-overlay)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkStandalone();

    // Check OS & Browser
    const ua = window.navigator.userAgent.toLowerCase();
    const isWin = /windows|win32|win64/.test(ua);
    setIsWindows(isWin);
    setIsEdge(/edg\//.test(ua));
    setIsChrome(/chrome\//.test(ua) && !/edg\//.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!deferredPrompt) {
      return "unavailable";
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return choice.outcome;
    } catch (err) {
      console.warn("PWA installation prompt failed:", err);
      return "unavailable";
    }
  };

  const install = async (): Promise<boolean> => {
    const res = await installApp();
    return res === "accepted";
  };

  return {
    canInstall: !!deferredPrompt,
    isInstallable: !!deferredPrompt,
    isInstalled,
    isWindows,
    isEdge,
    isChrome,
    installApp,
    install,
  };
}
