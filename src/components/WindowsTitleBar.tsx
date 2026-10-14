import React, { useState, useEffect } from "react";
import { ThemeColors } from "../types/theme";
import { SystemMetrics } from "../types/assistant";
import {
  Download,
  Laptop,
  Maximize2,
  Minimize2,
  X,
  Wifi,
  WifiOff,
  Cpu,
  HardDrive,
  Minus,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

interface WindowsTitleBarProps {
  theme: ThemeColors;
  currentPage: string;
  metrics: SystemMetrics | null;
  canInstall: boolean;
  isInstalled: boolean;
  onOpenWindowsHub: () => void;
  onInstallPWA?: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  theme,
  currentPage,
  metrics,
  canInstall,
  isInstalled,
  onOpenWindowsHub,
  onInstallPWA,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header
      className="w-full h-9 flex items-center justify-between px-3 select-none text-xs border-b shrink-0 z-40 transition-colors duration-200"
      style={{
        backgroundColor: theme.NAVY,
        borderColor: theme.BORDER,
        color: "#E2E8F0",
      }}
    >
      {/* Left: Windows Branding & App Title */}
      <div className="flex items-center space-x-2.5">
        {/* Windows 4-Tile Logo */}
        <div className="w-4 h-4 grid grid-cols-2 gap-[1px] p-[1px] rounded bg-sky-500/20">
          <div className="bg-sky-400 rounded-[1px]"></div>
          <div className="bg-blue-400 rounded-[1px]"></div>
          <div className="bg-cyan-500 rounded-[1px]"></div>
          <div className="bg-indigo-400 rounded-[1px]"></div>
        </div>

        <span className="font-semibold tracking-wide text-slate-100">
          PC Desktop Suite
        </span>

        <span className="text-slate-500">|</span>

        {/* Current Active Window Name */}
        <span className="font-medium text-slate-300 hidden sm:inline">
          {currentPage}
        </span>

        {/* Online / Offline badge */}
        <div
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
            isOnline
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
          }`}
          title={isOnline ? "Network Connected" : "Running 100% Offline"}
        >
          {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
          <span className="hidden md:inline">{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>

      {/* Center: Live Quick Hardware Stats (Windows Laptop Taskbar style) */}
      <div className="hidden lg:flex items-center space-x-3 text-[11px] font-mono text-slate-400">
        {metrics && (
          <>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/50 border border-slate-800">
              <Cpu className="w-3 h-3 text-sky-400" />
              <span>CPU: {metrics.cpuUsage || 18}%</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/50 border border-slate-800">
              <HardDrive className="w-3 h-3 text-emerald-400" />
              <span>RAM: {metrics.ramPercent || 36}%</span>
            </div>
          </>
        )}
      </div>

      {/* Right: Windows Action & Window Controls */}
      <div className="flex items-center space-x-2">
        {/* Install on Windows button */}
        {!isInstalled && (
          <button
            onClick={() => {
              if (canInstall && onInstallPWA) {
                onInstallPWA();
              } else {
                onOpenWindowsHub();
              }
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Install on Windows</span>
          </button>
        )}

        {isInstalled && (
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Windows App Active</span>
          </div>
        )}

        <button
          onClick={onOpenWindowsHub}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
          title="Windows Desktop Hub"
        >
          <ShieldCheck size={12} className="text-sky-400" />
          <span className="hidden sm:inline">Windows Hub</span>
        </button>

        {/* Windows clock */}
        <span className="text-slate-400 font-mono text-[11px] hidden sm:inline px-1">
          {currentTime}
        </span>

        {/* Standard Windows Title Bar buttons (Minimize, Maximize, Close) */}
        <div className="flex items-center ml-1 -mr-2">
          {/* Minimize button */}
          <button
            onClick={() => {
              const mainEl = document.getElementById("main-content-window");
              if (mainEl) {
                mainEl.classList.add("scale-95", "opacity-50");
                setTimeout(() => {
                  mainEl.classList.remove("scale-95", "opacity-50");
                }, 400);
              }
            }}
            className="w-9 h-8 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore button */}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-8 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? "Restore Down" : "Maximize (Full Screen)"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </button>

          {/* Close button */}
          <button
            onClick={() => setShowCloseModal(true)}
            className="w-9 h-8 flex items-center justify-center hover:bg-red-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Close prompt modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-xl p-5 shadow-2xl border text-slate-200"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="flex items-center gap-3 mb-2 font-bold text-sm text-white">
              <Laptop size={18} className="text-sky-400" />
              <span>Exit PC Desktop Suite?</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              All your Notes, Tasks, Files, and Secret Vault credentials are saved offline in local storage and will stay preserved.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  window.close();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
