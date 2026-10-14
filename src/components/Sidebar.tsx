import React from "react";
import { ThemeColors, ThemeName, THEMES } from "../types/theme";
import { Code2, Laptop, Download, CheckCircle } from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  theme: ThemeColors;
  onOpenPythonModal: () => void;
  onOpenInstallModal?: () => void;
  onOpenWindowsHub?: () => void;
  isInstalled: boolean;
  isInstallable?: boolean;
  onInstallPWA?: () => Promise<any>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentTheme,
  onThemeChange,
  theme,
  onOpenPythonModal,
  onOpenInstallModal,
  onOpenWindowsHub,
  isInstalled,
  isInstallable,
  onInstallPWA,
}) => {
  const pages = [
    { label: "Dashboard", icon: "🏠" },
    { label: "Computer Specs", icon: "💻" },
    { label: "Notes", icon: "📝" },
    { label: "Tasks & Focus", icon: "📋" },
    { label: "Secret Vault", icon: "🔐" },
    { label: "File Manager", icon: "📁" },
    { label: "Calculator", icon: "🧮" },
    { label: "PDF Studio", icon: "📄" },
  ];

  return (
    <aside
      className="w-64 h-full flex flex-col shrink-0 select-none border-r transition-colors duration-300"
      style={{
        backgroundColor: theme.SIDEBAR,
        borderColor: theme.BORDER,
      }}
    >
      {/* Top Banner - Windows Edition */}
      <div
        className="p-4 flex flex-col justify-center cursor-pointer"
        onClick={() => onNavigate("Dashboard")}
        style={{
          background: `linear-gradient(135deg, ${theme.NAVY} 0%, ${theme.BLUE} 60%, ${theme.MID} 100%)`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 grid grid-cols-2 gap-[2px] p-1 rounded-lg bg-sky-500/20 border border-sky-400/40">
            <div className="bg-sky-400 rounded-xs"></div>
            <div className="bg-blue-400 rounded-xs"></div>
            <div className="bg-cyan-400 rounded-xs"></div>
            <div className="bg-indigo-400 rounded-xs"></div>
          </div>
          <div>
            <h2 className="font-bold text-base text-white leading-tight">
              PC Desktop Suite
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono uppercase px-1 rounded bg-sky-400/20 text-sky-200 border border-sky-400/30">
                Windows App
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {pages.map(({ label, icon }) => {
          const isActive = currentPage === label;
          return (
            <button
              key={label}
              onClick={() => onNavigate(label)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-sm text-left transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: isActive ? theme.BLUE : "transparent",
                color: isActive ? "#FFFFFF" : theme.PALE,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = theme.CARD_HOVER;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}

        {/* Windows App Installer Launcher */}
        <div className="pt-3 border-t mt-2" style={{ borderColor: theme.BORDER }}>
          <button
            onClick={() => {
              if (onOpenWindowsHub) onOpenWindowsHub();
              else if (onOpenInstallModal) onOpenInstallModal();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs border transition-all duration-200 cursor-pointer group shadow-sm"
            style={{
              borderColor: `${theme.ACCENT}60`,
              backgroundColor: `${theme.ACCENT}15`,
              color: theme.PALE,
            }}
          >
            <div className="flex items-center gap-2">
              <Laptop size={16} className="text-sky-400 group-hover:scale-110 transition-transform" />
              <span>{isInstalled ? "Windows App Options" : "Install on Windows"}</span>
            </div>
            {isInstalled ? (
              <CheckCircle size={14} className="text-emerald-400" />
            ) : (
              <Download size={14} className="text-sky-400 animate-bounce" />
            )}
          </button>
        </div>

        {/* Python Desktop Code */}
        <div className="pt-1">
          <button
            onClick={onOpenPythonModal}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-xs border transition-all duration-200 cursor-pointer text-slate-400 hover:text-slate-200"
            style={{
              borderColor: theme.BORDER,
              backgroundColor: "transparent",
            }}
          >
            <Code2 size={15} />
            <span>Python Desktop Script</span>
          </button>
        </div>
      </nav>

      {/* Bottom Footer: Themes & Local Path */}
      <div
        className="p-3 border-t space-y-2.5"
        style={{ borderColor: theme.BORDER }}
      >
        {/* Theme Picker */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: theme.PALE }}
            >
              🎨 Theme
            </span>
            <span className="text-[10px] font-medium" style={{ color: theme.MUTED }}>
              {currentTheme}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {(Object.keys(THEMES) as ThemeName[]).map((themeName) => {
              const tColors = THEMES[themeName];
              const isSelected = themeName === currentTheme;
              return (
                <button
                  key={themeName}
                  title={themeName}
                  onClick={() => onThemeChange(themeName)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: tColors.BLUE,
                    border: isSelected
                      ? `2px solid #FFFFFF`
                      : `2px solid ${tColors.BORDER}`,
                    color: "#FFFFFF",
                  }}
                >
                  {isSelected && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Windows Laptop Status */}
        <div
          className="text-[10px] leading-relaxed p-2 rounded-lg"
          style={{ backgroundColor: theme.CARD, color: theme.MUTED }}
        >
          <div className="flex items-center justify-between font-semibold text-white/90">
            <span>Windows Offline Suite</span>
            <span className="text-emerald-400">Ready</span>
          </div>
          <div className="truncate font-mono text-[9px] mt-0.5 text-slate-400">
            C:\Users\PC\AppData\Local
          </div>
        </div>
      </div>
    </aside>
  );
};
