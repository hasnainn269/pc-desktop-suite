import React from "react";
import { ThemeColors } from "../types/theme";
import { GradientBanner } from "./GradientBanner";
import { SystemMetrics } from "../types/assistant";
import { ArrowRight, LayoutGrid, Laptop, Download, CheckCircle2, ShieldCheck, Terminal } from "lucide-react";

interface DashboardProps {
  theme: ThemeColors;
  notesCount: number;
  metrics: SystemMetrics | null;
  onNavigate: (page: string) => void;
  onOpenWindowsHub: () => void;
  isInstalled: boolean;
  isInstallable: boolean;
  onInstallPWA?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  theme,
  notesCount,
  metrics,
  onNavigate,
  onOpenWindowsHub,
  isInstalled,
  isInstallable,
  onInstallPWA,
}) => {
  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const ramText = metrics ? `${metrics.ramUsedGB} / ${metrics.ramTotalGB} GB (${metrics.ramPercent}%)` : "6.1 / 16.0 GB (38%)";
  const romText = metrics ? `${metrics.romFreeGB} GB free (${metrics.romTotalGB} GB)` : "297 GB free / 512 GB";
  const cpuText = metrics?.cpuGeneration || "13th Gen Intel Core";

  const cards = [
    {
      icon: "💻",
      title: "Computer Specs",
      description: "Live RAM, ROM (storage), Processor Generation, Windows 11 OS & Hardware.",
    },
    {
      icon: "📝",
      title: "Notes",
      description: "Write, search and manage notes offline with auto-save & Ctrl+S.",
    },
    {
      icon: "📁",
      title: "File Manager",
      description: "Search, browse, upload and open workspace files & documents.",
    },
    {
      icon: "📋",
      title: "Tasks & Focus",
      description: "Daily To-Do planner, priority checklist & 25-minute Pomodoro focus timer.",
    },
    {
      icon: "🔐",
      title: "Secret Vault",
      description: "PIN-protected locker for passwords, API keys & strong password generator.",
    },
    {
      icon: "🧮",
      title: "Calculator",
      description: "Keypad calculator with safe evaluation, history & data converter.",
    },
    {
      icon: "📄",
      title: "PDF Studio",
      description: "Find PDFs, extract text, and read indexed documents in-app.",
    },
  ];

  const quickShortcuts = [
    { label: "💻 Computer Specs", page: "Computer Specs" },
    { label: "📝 Notes", page: "Notes" },
    { label: "📋 Tasks & Focus", page: "Tasks & Focus" },
    { label: "🔐 Secret Vault", page: "Secret Vault" },
    { label: "📁 File Manager", page: "File Manager" },
    { label: "🧮 Calculator", page: "Calculator" },
    { label: "📄 PDF Studio", page: "PDF Studio" },
  ];

  return (
    <div className="space-y-4">
      <GradientBanner
        title="Dashboard"
        subtitle={`Welcome back  ·  ${todayStr}`}
        theme={theme}
      />

      {/* Windows 11 / 10 App Conversion Banner */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-md"
        style={{
          background: `linear-gradient(135deg, ${theme.NAVY} 0%, ${theme.CARD} 80%)`,
          borderColor: theme.BORDER,
        }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center shrink-0 shadow-inner">
            <svg className="w-7 h-7 text-sky-400" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 2.25A.25.25 0 0 1 .25 2H7v6H0V2.25zm8-.25h6.75a.25.25 0 0 1 .25.25V8H8V2zM0 9h7v6H.25A.25.25 0 0 1 0 14.75V9zm8 0h7v5.75a.25.25 0 0 1-.25.25H8V9z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Windows Laptop & PC Desktop Application
              </h3>
              {isInstalled ? (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 size={11} /> Installed on Windows
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Standalone Ready
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Run this complete suite as a dedicated desktop app on Windows with full offline storage, Windows Taskbar pinning, and live hardware monitoring.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          {!isInstalled && (
            <button
              onClick={() => {
                if (isInstallable && onInstallPWA) {
                  onInstallPWA();
                } else {
                  onOpenWindowsHub();
                }
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Download size={14} />
              <span>Install to Windows</span>
            </button>
          )}

          <button
            onClick={onOpenWindowsHub}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-white/10 transition-colors"
            style={{
              borderColor: theme.BORDER,
              color: theme.PALE,
            }}
          >
            <Terminal size={14} className="text-sky-400" />
            <span>Desktop Options & .BAT</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Row: RAM, ROM, Processor, Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          className="p-3.5 rounded-2xl border transition-all"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div
            className="text-base font-bold font-mono tracking-tight truncate text-white"
            style={{ color: theme.ACCENT }}
          >
            {ramText}
          </div>
          <div className="text-xs font-medium mt-1 flex justify-between" style={{ color: theme.MUTED }}>
            <span>RAM in use</span>
            <span className="font-mono text-[10px] text-sky-400">DDR4/DDR5</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-2xl border transition-all"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div
            className="text-base font-bold font-mono tracking-tight truncate text-white"
            style={{ color: theme.ACCENT }}
          >
            {romText}
          </div>
          <div className="text-xs font-medium mt-1 flex justify-between" style={{ color: theme.MUTED }}>
            <span>ROM (Storage)</span>
            <span className="font-mono text-[10px] text-emerald-400">NVMe SSD</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-2xl border transition-all"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div
            className="text-base font-bold tracking-tight truncate text-white"
            style={{ color: theme.ACCENT }}
          >
            {cpuText}
          </div>
          <div className="text-xs font-medium mt-1 flex justify-between" style={{ color: theme.MUTED }}>
            <span>Processor Generation</span>
            <span className="font-mono text-[10px] text-sky-400">Windows 11</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-2xl border transition-all"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div
            className="text-base font-bold tracking-tight"
            style={{ color: theme.ACCENT }}
          >
            {notesCount} Notes
          </div>
          <div className="text-xs font-medium mt-1 flex justify-between" style={{ color: theme.MUTED }}>
            <span>Saved Offline Notes</span>
            <span className="font-mono text-[10px] text-amber-400">Ctrl+S Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Tool Navigation Shortcuts */}
      <div
        className="p-3.5 rounded-2xl border flex flex-wrap items-center gap-2"
        style={{
          backgroundColor: theme.CARD,
          borderColor: theme.BORDER,
        }}
      >
        <div className="flex items-center gap-1.5 text-xs font-bold mr-2 text-white/90">
          <LayoutGrid size={14} style={{ color: theme.ACCENT }} />
          <span>Quick Launch:</span>
        </div>
        {quickShortcuts.map(({ label, page }) => (
          <button
            key={label}
            onClick={() => onNavigate(page)}
            className="text-xs font-medium px-2.5 py-1 rounded-lg border transition-all"
            style={{
              borderColor: theme.BORDER,
              backgroundColor: "transparent",
              color: theme.PALE,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.CARD_HOVER;
              e.currentTarget.style.borderColor = theme.ACCENT;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = theme.BORDER;
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid of Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
        {cards.map(({ icon, title, description }) => (
          <div
            key={title}
            onClick={() => onNavigate(title)}
            className="group p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.CARD_HOVER;
              e.currentTarget.style.borderColor = theme.ACCENT;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.CARD;
              e.currentTarget.style.borderColor = theme.BORDER;
            }}
          >
            <div>
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {title}
              </h3>
              <p
                className="text-xs mt-1.5 leading-relaxed"
                style={{ color: theme.MUTED }}
              >
                {description}
              </p>
            </div>

            <div className="mt-4 pt-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: theme.BLUE,
                  color: "#FFFFFF",
                }}
              >
                Open <ArrowRight size={13} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
