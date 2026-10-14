import React, { useState } from "react";
import { ThemeColors } from "../types/theme";
import {
  Download,
  Laptop,
  CheckCircle2,
  X,
  FileCode,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  HardDrive,
  Cpu,
} from "lucide-react";

interface WindowsAppModalProps {
  theme: ThemeColors;
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallPWA: () => void;
  onOpenPythonModal: () => void;
}

export const WindowsAppModal: React.FC<WindowsAppModalProps> = ({
  theme,
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  onInstallPWA,
  onOpenPythonModal,
}) => {
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [activeTab, setActiveTab] = useState<"pwa" | "batch" | "python">("pwa");

  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://localhost:3000";

  // Windows Batch Launcher Script
  const batchScriptContent = `@echo off
:: ===================================================
:: PC Desktop Suite - Windows Native Desktop Launcher
:: ===================================================
title PC Desktop Suite - Windows App
echo Starting PC Desktop Suite on your Windows laptop...

set APP_URL=${currentUrl}

:: 1. Try launching via Microsoft Edge in Dedicated App Mode (Borderless, No URL Bar)
where msedge >nul 2>&1
if %errorlevel% equ 0 (
    echo Launching with Microsoft Edge App Window...
    start msedge --app="%APP_URL%" --window-size=1280,820 --start-maximized
    exit
)

:: 2. Try launching via Google Chrome in Dedicated App Mode
where chrome >nul 2>&1
if %errorlevel% equ 0 (
    echo Launching with Google Chrome App Window...
    start chrome --app="%APP_URL%" --window-size=1280,820 --start-maximized
    exit
)

:: 3. Try default Windows browser if Edge/Chrome not in PATH
start "" "%APP_URL%"
exit
`;

  const downloadBatchFile = () => {
    const blob = new Blob([batchScriptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Launch-PC-Desktop-Suite.bat";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyBatchScript = () => {
    navigator.clipboard.writeText(batchScriptContent);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden text-slate-100"
        style={{
          backgroundColor: theme.CARD,
          borderColor: theme.BORDER,
        }}
      >
        {/* Header with Windows branding */}
        <div
          className="p-5 flex items-center justify-between border-b"
          style={{
            background: `linear-gradient(135deg, ${theme.NAVY} 0%, ${theme.BLUE} 70%, ${theme.MID} 100%)`,
            borderColor: theme.BORDER,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-inner">
              <svg className="w-6 h-6 text-sky-300" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 2.25A.25.25 0 0 1 .25 2H7v6H0V2.25zm8-.25h6.75a.25.25 0 0 1 .25.25V8H8V2zM0 9h7v6H.25A.25.25 0 0 1 0 14.75V9zm8 0h7v5.75a.25.25 0 0 1-.25.25H8V9z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Windows Laptop & PC App Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/30 text-sky-200 border border-sky-400/40">
                  Windows 11 & 10
                </span>
              </div>
              <p className="text-xs text-sky-100/80 mt-0.5">
                Convert and run this entire suite natively on your Windows laptop with offline persistence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div
          className="flex border-b px-5 pt-3 gap-2 bg-slate-950/40"
          style={{ borderColor: theme.BORDER }}
        >
          <button
            onClick={() => setActiveTab("pwa")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "pwa"
                ? "border-sky-400 text-white bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Laptop size={14} />
            <span>1. Native Windows PWA App</span>
            {isInstalled && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                Active
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("batch")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "batch"
                ? "border-sky-400 text-white bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal size={14} />
            <span>2. Windows .BAT Launcher</span>
          </button>

          <button
            onClick={() => setActiveTab("python")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "python"
                ? "border-sky-400 text-white bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode size={14} />
            <span>3. Python GUI (.py) Script</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* TAB 1: PWA Native Windows App */}
          {activeTab === "pwa" && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                style={{
                  backgroundColor: theme.SIDEBAR,
                  borderColor: theme.BORDER,
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base">
                      {isInstalled ? "Windows App Is Installed!" : "Install Directly to Windows"}
                    </h4>
                    {isInstalled && (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 size={13} /> Installed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-lg">
                    When installed on Windows via Microsoft Edge or Google Chrome, this app gets placed in your <strong>Windows Start Menu</strong>, <strong>Desktop</strong>, and <strong>Taskbar</strong>. It opens in its own borderless window with zero browser bars!
                  </p>
                </div>

                <div>
                  {isInstalled ? (
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>Running in Standalone App Mode</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (isInstallable) {
                          onInstallPWA();
                        } else {
                          // Prompt user to use browser install button in address bar
                          alert(
                            "To install on Windows:\n\n1. Look at your browser address bar (top right)\n2. Click the 'Install App' or '+' icon\n3. Click 'Install' to add PC Desktop Suite to your Windows Start Menu & Desktop!"
                          );
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                    >
                      <Download size={15} />
                      <span>Install Windows App Now</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Windows Integration Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  className="p-3.5 rounded-xl border space-y-1.5"
                  style={{ backgroundColor: theme.SIDEBAR, borderColor: theme.BORDER }}
                >
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                    <Laptop size={15} />
                    <span>Windows Start Menu & Taskbar</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Pin directly to your Windows 11/10 Taskbar for quick 1-click startup anytime without opening a browser.
                  </p>
                </div>

                <div
                  className="p-3.5 rounded-xl border space-y-1.5"
                  style={{ backgroundColor: theme.SIDEBAR, borderColor: theme.BORDER }}
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck size={15} />
                    <span>100% Offline Capability</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Full service worker caching guarantees you can view hardware diagnostics, notes, and calculators without internet.
                  </p>
                </div>

                <div
                  className="p-3.5 rounded-xl border space-y-1.5"
                  style={{ backgroundColor: theme.SIDEBAR, borderColor: theme.BORDER }}
                >
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                    <Cpu size={15} />
                    <span>Native Borderless Frame</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Clean desktop frame with dedicated Windows Title bar, minimize, restore, and maximize full-screen view.
                  </p>
                </div>
              </div>

              {/* Step-by-Step Instructions for Edge / Chrome on Windows */}
              <div
                className="p-4 rounded-xl border space-y-3"
                style={{ backgroundColor: theme.SIDEBAR, borderColor: theme.BORDER }}
              >
                <h5 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Laptop size={14} className="text-sky-400" />
                  <span>How to install on Windows in 5 seconds</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-sky-300 flex items-center gap-1.5">
                      <span>🔵 Microsoft Edge (Windows Default)</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Open this page in <strong>Microsoft Edge</strong></li>
                      <li>Click the <strong>App icon (⊞)</strong> in the top-right of the address bar</li>
                      <li>Select <strong>Install PC Desktop Suite</strong></li>
                      <li>Check <em>Pin to taskbar</em> & <em>Create Desktop shortcut</em></li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span>🟡 Google Chrome / Brave</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Open this page in <strong>Google Chrome</strong></li>
                      <li>Look for the <strong>Install icon (⬇)</strong> on the right of the address bar</li>
                      <li>Or click <strong>⋮ Menu → Save and Share → Install page as app...</strong></li>
                      <li>Click <strong>Install</strong> to launch instantly as a desktop program</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Windows Batch Launcher */}
          {activeTab === "batch" && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl border space-y-2"
                style={{ backgroundColor: theme.SIDEBAR, borderColor: theme.BORDER }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Windows Desktop Batch Launcher (.BAT)
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Download this script to your Windows laptop. Double-click it on Windows to launch the app directly into a clean, borderless standalone desktop window.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyBatchScript}
                      className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                      style={{ borderColor: theme.BORDER, color: theme.PALE }}
                    >
                      {copiedBatch ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedBatch ? "Copied!" : "Copy Code"}</span>
                    </button>

                    <button
                      onClick={downloadBatchFile}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                    >
                      <Download size={14} />
                      <span>Download .BAT</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 relative">
                  <pre className="p-3.5 rounded-lg bg-slate-950 font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed">
                    {batchScriptContent}
                  </pre>
                </div>

                <div className="text-[11px] text-slate-400 pt-1">
                  💡 <strong>Tip for Windows:</strong> Save this file as <code>Launch-PC-Desktop-Suite.bat</code> on your Desktop. Right-click it and choose <em>"Create Shortcut"</em>, then change the icon in Shortcut Properties to customize your desktop icon!
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Python CustomTkinter Desktop Script */}
          {activeTab === "python" && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl border space-y-3"
                style={{ backgroundColor: theme.SIDEBAR, borderColor: theme.BORDER }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Pure Python Windows Native Desktop App (CustomTkinter)
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Prefer a 100% Python desktop executable for Windows? You can run our bundled Python desktop application that compiles with PyInstaller into a standalone <code>.exe</code> file!
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenPythonModal();
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors shrink-0"
                  >
                    <FileCode size={14} />
                    <span>View / Download Python Script</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-sky-300">How to run or build an .EXE on Windows:</div>
                  <div className="font-mono text-[11px] p-2.5 rounded bg-slate-950 text-slate-200 border border-slate-800 space-y-1">
                    <div># 1. Install prerequisites in Windows Command Prompt (cmd) or PowerShell:</div>
                    <div className="text-emerald-400">pip install customtkinter psutil pillow</div>
                    <div className="mt-2"># 2. Run the script:</div>
                    <div className="text-emerald-400">python personal_assistant.py</div>
                    <div className="mt-2"># 3. (Optional) Convert to single-file Windows .EXE:</div>
                    <div className="text-emerald-400">pip install pyinstaller</div>
                    <div className="text-emerald-400">pyinstaller --noconsole --onefile personal_assistant.py</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="p-4 border-t flex items-center justify-between bg-slate-950/60"
          style={{ borderColor: theme.BORDER }}
        >
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <HardDrive size={13} className="text-sky-400" />
            <span>Windows 11 / Windows 10 Compatible • 64-bit & ARM64 Laptop Support</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
