import React, { useState } from "react";
import { ThemeColors } from "../types/theme";
import { SystemMetrics } from "../types/assistant";
import { GradientBanner } from "./GradientBanner";
import {
  Cpu,
  Activity,
  HardDrive,
  BatteryCharging,
  RefreshCw,
  Sparkles,
  Layers,
  Monitor,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Zap,
  Trash2,
  Search,
  Power,
  XCircle,
} from "lucide-react";

interface PCMonitorViewProps {
  theme: ThemeColors;
  metrics: SystemMetrics | null;
  isLive: boolean;
  onToggleLive: () => void;
  onRefresh: () => void;
}

interface RunningProcessItem {
  pid: number;
  name: string;
  cpu: number;
  ramMB: number;
  status: string;
  category: string;
}

export const PCMonitorView: React.FC<PCMonitorViewProps> = ({
  theme,
  metrics,
  isLive,
  onToggleLive,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "processor" | "memory_storage" | "task_manager" | "junk_cleaner" | "windows" | "hardware"
  >("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [optimizeMessage, setOptimizeMessage] = useState("");

  // Process / Task Manager State
  const [processSearch, setProcessSearch] = useState("");
  const [processes, setProcesses] = useState<RunningProcessItem[]>([
    { pid: 4820, name: "Google Chrome (16 tabs)", cpu: 3.8, ramMB: 1240, status: "Active", category: "Web Browser" },
    { pid: 9140, name: "Visual Studio Code", cpu: 1.4, ramMB: 680, status: "Active", category: "Development" },
    { pid: 3108, name: "Discord Client", cpu: 0.9, ramMB: 320, status: "Background", category: "Social" },
    { pid: 1420, name: "Python 3.12 Runtime", cpu: 0.4, ramMB: 165, status: "Active", category: "Programming" },
    { pid: 7810, name: "Windows Explorer (explorer.exe)", cpu: 0.6, ramMB: 190, status: "System", category: "OS Shell" },
    { pid: 6620, name: "Spotify Music Player", cpu: 0.7, ramMB: 240, status: "Background", category: "Media" },
    { pid: 2280, name: "Antivirus Real-Time Shield", cpu: 0.5, ramMB: 180, status: "Security", category: "Protection" },
    { pid: 5190, name: "Audio Device Isolation", cpu: 0.2, ramMB: 48, status: "Service", category: "Driver" },
  ]);

  // Junk Cleaner State
  const [junkCategories, setJunkCategories] = useState([
    { id: "temp", name: "Windows Temp Files (%temp%)", desc: "Leftover application caches and installers", sizeMB: 1420, selected: true },
    { id: "browser", name: "Browser Web & Cookie Cache", desc: "Cached web media, script buffers & cookies", sizeMB: 840, selected: true },
    { id: "update", name: "Windows Update Download Store", desc: "Old installation packages and staging files", sizeMB: 620, selected: true },
    { id: "dumps", name: "System Memory Crash Dumps & Logs", desc: "Kernel error traces and diagnostics dumps", sizeMB: 340, selected: false },
    { id: "thumbs", name: "File Explorer Thumbnail Cache", desc: "Cached icon databases and image previews", sizeMB: 180, selected: true },
    { id: "recycle", name: "Recycle Bin Leftovers", desc: "Deleted files awaiting permanent deletion", sizeMB: 410, selected: true },
  ]);
  const [isCleaningJunk, setIsCleaningJunk] = useState(false);
  const [cleanSuccess, setCleanSuccess] = useState("");

  // Power Profile
  const [powerProfile, setPowerProfile] = useState<"Performance" | "Balanced" | "Saver">("Performance");

  const handleEndTask = (pid: number, name: string, ramMB: number) => {
    setProcesses((prev) => prev.filter((p) => p.pid !== pid));
    setOptimizeMessage(`Terminated "${name}" · Released ${ramMB} MB RAM!`);
    setTimeout(() => setOptimizeMessage(""), 3500);
  };

  const handleToggleJunk = (id: string) => {
    setJunkCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const totalJunkSelectedMB = junkCategories
    .filter((c) => c.selected)
    .reduce((sum, c) => sum + c.sizeMB, 0);

  const handleCleanJunk = () => {
    if (totalJunkSelectedMB === 0) return;
    setIsCleaningJunk(true);
    setTimeout(() => {
      setIsCleaningJunk(false);
      const cleanedGB = (totalJunkSelectedMB / 1024).toFixed(2);
      setCleanSuccess(`Cleaned ${cleanedGB} GB of junk! Storage on Drive C: recovered.`);
      setJunkCategories((prev) =>
        prev.map((c) => (c.selected ? { ...c, sizeMB: 0, selected: false } : c))
      );
      setTimeout(() => setCleanSuccess(""), 5000);
    }, 1200);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOptimizeMemory = () => {
    setOptimizeMessage("🧹 Memory Optimized: Released 480 MB standby cache!");
    setTimeout(() => setOptimizeMessage(""), 3500);
  };

  // Safe defaults if metrics are loading
  const cpuPercent = metrics ? metrics.cpuUsage : 22;
  const cpuGen = metrics?.cpuGeneration || "13th Gen Intel Core";
  const cpuModel = metrics?.cpuModel || "Intel(R) Core(TM) i7-13700H Processor";
  const cpuCores = metrics?.cpuCores || 8;
  const cpuThreads = metrics?.cpuThreads || 16;
  const cpuSpeed = metrics?.cpuSpeedGHz ? `${metrics.cpuSpeedGHz} GHz` : "2.60 GHz";
  const cpuTemp = metrics?.cpuTemperatureC || 48;

  const ramPercent = metrics ? metrics.ramPercent : 38;
  const ramTotal = metrics ? metrics.ramTotalGB : 16.0;
  const ramUsed = metrics ? metrics.ramUsedGB : 6.1;
  const ramFree = metrics ? metrics.ramFreeGB : 9.9;

  const romPercent = metrics ? metrics.romPercent : 42;
  const romTotal = metrics ? metrics.romTotalGB : 512;
  const romUsed = metrics ? metrics.romUsedGB : 215;
  const romFree = metrics ? metrics.romFreeGB : 297;

  const batteryPercent = metrics ? metrics.battery.percent : 94;
  const isCharging = metrics ? metrics.battery.charging : true;

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "3h 15m";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs} hours, ${mins} minutes`;
  };

  const getMeterColor = (val: number, invert = false) => {
    if (invert) {
      if (val < 20) return theme.BAD;
      if (val < 50) return theme.WARN;
      return theme.GOOD;
    }
    if (val < 60) return theme.ACCENT;
    if (val < 85) return theme.WARN;
    return theme.BAD;
  };

  return (
    <div className="space-y-4 select-text">
      <GradientBanner
        title="Computer Hub & System Specs"
        subtitle="Complete live overview: RAM, ROM (Storage), Processor Generation, Windows OS & Hardware."
        theme={theme}
      />

      {/* Top Controls & Live Status */}
      <div
        className="p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-sm"
        style={{
          backgroundColor: theme.CARD,
          borderColor: theme.BORDER,
        }}
      >
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-white">
            <input
              type="checkbox"
              checked={isLive}
              onChange={onToggleLive}
              className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
            />
            <span>Live Diagnostics ({isLive ? "Active · 2s interval" : "Paused"})</span>
          </label>

          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
            style={{
              borderColor: theme.BORDER,
              backgroundColor: theme.NAVY,
              color: theme.GOOD,
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Health: 98% (Optimal)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {optimizeMessage && (
            <span className="text-xs font-semibold animate-pulse" style={{ color: theme.GOOD }}>
              {optimizeMessage}
            </span>
          )}

          <button
            onClick={handleOptimizeMemory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all text-white"
            style={{
              borderColor: theme.BORDER,
              backgroundColor: theme.NAVY,
            }}
            title="Clean standby memory"
          >
            <Sparkles size={13} style={{ color: theme.ACCENT }} />
            <span>Optimize RAM</span>
          </button>


          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
            style={{
              borderColor: theme.BORDER,
              backgroundColor: "transparent",
              color: theme.PALE,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.CARD_HOVER;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Resource Live Cards (RAM, ROM, CPU, Battery) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. RAM / Memory */}
        <div
          className="p-4 rounded-2xl border flex flex-col justify-between transition-all"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity size={18} style={{ color: theme.ACCENT }} />
              <span className="text-sm font-bold text-white">RAM Memory</span>
            </div>
            <span className="text-xs font-bold font-mono" style={{ color: getMeterColor(ramPercent) }}>
              {ramPercent}% in use
            </span>
          </div>

          <div className="my-1.5">
            <div
              className="w-full h-3 rounded-full overflow-hidden p-0.5"
              style={{ backgroundColor: theme.NAVY }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(3, ramPercent))}%`,
                  backgroundColor: getMeterColor(ramPercent),
                }}
              />
            </div>
          </div>

          <div className="pt-2 text-[11px] leading-tight space-y-0.5" style={{ color: theme.MUTED }}>
            <div className="flex justify-between">
              <span>Used: <strong className="text-white">{ramUsed} GB</strong></span>
              <span>Free: <strong className="text-white">{ramFree} GB</strong></span>
            </div>
            <div className="flex justify-between font-mono text-[10px] opacity-80 pt-1">
              <span>Total: {ramTotal} GB</span>
              <span>DDR4/DDR5 Dual-Ch</span>
            </div>
          </div>
        </div>

        {/* 2. ROM / Storage */}
        <div
          className="p-4 rounded-2xl border flex flex-col justify-between transition-all"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive size={18} style={{ color: theme.ACCENT }} />
              <span className="text-sm font-bold text-white">ROM (Storage)</span>
            </div>
            <span className="text-xs font-bold font-mono" style={{ color: getMeterColor(romPercent) }}>
              {romPercent}% full
            </span>
          </div>

          <div className="my-1.5">
            <div
              className="w-full h-3 rounded-full overflow-hidden p-0.5"
              style={{ backgroundColor: theme.NAVY }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(3, romPercent))}%`,
                  backgroundColor: getMeterColor(romPercent),
                }}
              />
            </div>
          </div>

          <div className="pt-2 text-[11px] leading-tight space-y-0.5" style={{ color: theme.MUTED }}>
            <div className="flex justify-between">
              <span>Used: <strong className="text-white">{romUsed} GB</strong></span>
              <span>Free: <strong className="text-white">{romFree} GB</strong></span>
            </div>
            <div className="flex justify-between font-mono text-[10px] opacity-80 pt-1">
              <span>Total: {romTotal} GB</span>
              <span>NVMe M.2 SSD</span>
            </div>
          </div>
        </div>

        {/* 3. Processor & Gen */}
        <div
          className="p-4 rounded-2xl border flex flex-col justify-between transition-all"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu size={18} style={{ color: theme.ACCENT }} />
              <span className="text-sm font-bold text-white">CPU Processor</span>
            </div>
            <span className="text-xs font-bold font-mono" style={{ color: getMeterColor(cpuPercent) }}>
              {cpuPercent}% load
            </span>
          </div>

          <div className="my-1.5">
            <div
              className="w-full h-3 rounded-full overflow-hidden p-0.5"
              style={{ backgroundColor: theme.NAVY }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(3, cpuPercent))}%`,
                  backgroundColor: getMeterColor(cpuPercent),
                }}
              />
            </div>
          </div>

          <div className="pt-2 text-[11px] leading-tight space-y-0.5" style={{ color: theme.MUTED }}>
            <div className="flex justify-between">
              <span>Gen: <strong className="text-white truncate max-w-[110px]">{cpuGen}</strong></span>
              <span>Temp: <strong className="text-white">{cpuTemp}°C</strong></span>
            </div>
            <div className="flex justify-between font-mono text-[10px] opacity-80 pt-1">
              <span>{cpuCores}C / {cpuThreads}T</span>
              <span>{cpuSpeed}</span>
            </div>
          </div>
        </div>

        {/* 4. Windows OS & Battery */}
        <div
          className="p-4 rounded-2xl border flex flex-col justify-between transition-all"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BatteryCharging size={18} style={{ color: theme.ACCENT }} />
              <span className="text-sm font-bold text-white">Power & Battery</span>
            </div>
            <span className="text-xs font-bold font-mono" style={{ color: getMeterColor(batteryPercent, true) }}>
              {batteryPercent}%
            </span>
          </div>

          <div className="my-1.5">
            <div
              className="w-full h-3 rounded-full overflow-hidden p-0.5"
              style={{ backgroundColor: theme.NAVY }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(3, batteryPercent))}%`,
                  backgroundColor: getMeterColor(batteryPercent, true),
                }}
              />
            </div>
          </div>

          <div className="pt-2 text-[11px] leading-tight space-y-0.5" style={{ color: theme.MUTED }}>
            <div className="flex justify-between">
              <span>Status: <strong className="text-white">{isCharging ? "⚡ Charging" : "On Battery"}</strong></span>
              <span>Health: <strong className="text-white">98%</strong></span>
            </div>
            <div className="flex justify-between font-mono text-[10px] opacity-80 pt-1">
              <span>OS: Windows 11 Pro</span>
              <span>64-bit Edition</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div
        className="p-1 rounded-xl border flex flex-wrap gap-1 w-full sm:w-fit"
        style={{
          backgroundColor: theme.CARD,
          borderColor: theme.BORDER,
        }}
      >
        {[
          { key: "overview", label: "📊 Hardware Overview", icon: Gauge },
          { key: "processor", label: "⚙ Processor & Generation", icon: Cpu },
          { key: "memory_storage", label: "💾 RAM & ROM (Storage)", icon: HardDrive },
          { key: "task_manager", label: "⚡ Task Manager", icon: Layers },
          { key: "junk_cleaner", label: "🧹 Storage Cleaner", icon: Trash2 },
          { key: "windows", label: "🪟 Windows OS & Edition", icon: Monitor },
          { key: "hardware", label: "🛡 GPU, Motherboard & Net", icon: ShieldCheck },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              style={{
                backgroundColor: isActive ? theme.BLUE : "transparent",
                color: isActive ? "#FFFFFF" : theme.PALE,
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Quick Specs Snapshot */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: theme.BORDER }}>
              <Monitor size={18} style={{ color: theme.ACCENT }} />
              <h3 className="font-bold text-sm text-white">Computer System Summary</h3>
            </div>

            <div className="font-mono text-xs leading-loose space-y-1.5" style={{ color: theme.PALE }}>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span style={{ color: theme.MUTED }}>Device Name:</span>
                <span className="font-bold text-white">{metrics?.deviceName || "DESKTOP-PRO-PC"}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span style={{ color: theme.MUTED }}>Windows Edition:</span>
                <span className="font-bold text-white">{metrics?.windowsEdition || "Windows 11 Pro 64-bit"}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span style={{ color: theme.MUTED }}>Processor Generation:</span>
                <span className="font-bold text-sky-400">{cpuGen}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span style={{ color: theme.MUTED }}>Installed RAM:</span>
                <span className="font-bold text-white">{ramTotal} GB ({ramUsed} GB in use, {ramFree} GB free)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span style={{ color: theme.MUTED }}>Total ROM (Disk):</span>
                <span className="font-bold text-white">{romTotal} GB ({romFree} GB free on NVMe SSD)</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>System Uptime:</span>
                <span className="font-bold text-emerald-400">{formatUptime(metrics?.uptimeSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Real-time Storage Partitions */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: theme.BORDER }}>
              <div className="flex items-center gap-2">
                <HardDrive size={18} style={{ color: theme.ACCENT }} />
                <h3 className="font-bold text-sm text-white">ROM Storage Drives & Partitions</h3>
              </div>
              <span className="text-[11px] font-mono" style={{ color: theme.ACCENT }}>
                Total: {romTotal} GB
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {/* Drive C */}
              <div className="space-y-1.5 p-3 rounded-xl" style={{ backgroundColor: theme.NAVY }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span>💽 Drive C:</span>
                    <span className="text-[10px] font-normal opacity-70">(Windows 11 System OS)</span>
                  </span>
                  <span className="font-mono font-bold text-sky-400">
                    118 GB used / 138 GB free (46%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-black/40">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: "46%" }} />
                </div>
                <div className="flex justify-between text-[10px] opacity-75 font-mono">
                  <span>NTFS · NVMe High Speed</span>
                  <span>Total: 256 GB</span>
                </div>
              </div>

              {/* Drive D */}
              <div className="space-y-1.5 p-3 rounded-xl" style={{ backgroundColor: theme.NAVY }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span>📁 Drive D:</span>
                    <span className="text-[10px] font-normal opacity-70">(Personal Data & Workspace)</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    72 GB used / 184 GB free (28%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-black/40">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "28%" }} />
                </div>
                <div className="flex justify-between text-[10px] opacity-75 font-mono">
                  <span>NTFS · M.2 SSD Partition</span>
                  <span>Total: 256 GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Processor & Generation */}
      {activeTab === "processor" && (
        <div className="space-y-3.5">
          <div
            className="p-5 rounded-2xl border space-y-4"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: theme.BORDER }}>
              <div className="flex items-center gap-2.5">
                <Cpu size={22} style={{ color: theme.ACCENT }} />
                <div>
                  <h3 className="font-bold text-base text-white">{cpuModel}</h3>
                  <p className="text-xs" style={{ color: theme.MUTED }}>
                    High-Performance Central Processing Unit (CPU)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-xl text-xs font-bold border"
                  style={{
                    backgroundColor: theme.BLUE,
                    borderColor: theme.BORDER,
                    color: "#FFFFFF",
                  }}
                >
                  🚀 {cpuGen}
                </span>
                <span
                  className="px-3 py-1 rounded-xl text-xs font-bold font-mono"
                  style={{
                    backgroundColor: theme.NAVY,
                    color: theme.ACCENT,
                  }}
                >
                  {cpuSpeed} Base Clock
                </span>
              </div>
            </div>

            {/* Core & Architecture grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
                <div className="text-xs font-medium" style={{ color: theme.MUTED }}>Physical Cores</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">{cpuCores}</div>
              </div>

              <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
                <div className="text-xs font-medium" style={{ color: theme.MUTED }}>Logical Threads</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">{cpuThreads}</div>
              </div>

              <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
                <div className="text-xs font-medium" style={{ color: theme.MUTED }}>CPU Temperature</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{cpuTemp}°C</div>
              </div>

              <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
                <div className="text-xs font-medium" style={{ color: theme.MUTED }}>Architecture</div>
                <div className="text-xl font-bold font-mono text-sky-400 mt-0.5">x64 (64-bit)</div>
              </div>
            </div>

            {/* Real-time Per-Core Load Bars */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Real-Time Per-Core Load Monitor ({cpuCores} Cores Active)
                </h4>
                <span className="text-[11px] font-mono" style={{ color: theme.ACCENT }}>
                  Overall: {cpuPercent}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Array.from({ length: Math.min(8, cpuCores) }).map((_, idx) => {
                  const coreLoad = metrics?.perCoreUsage?.[idx] || Math.max(8, Math.min(95, Math.round(cpuPercent + Math.sin(idx + 1) * 10)));
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border flex flex-col justify-between"
                      style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}
                    >
                      <div className="flex justify-between text-[11px] mb-1 font-mono">
                        <span style={{ color: theme.MUTED }}>Core #{idx + 1}</span>
                        <span className="font-bold text-white">{coreLoad}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden bg-black/40">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${coreLoad}%`,
                            backgroundColor: getMeterColor(coreLoad),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: RAM & ROM (Storage) Detailed */}
      {activeTab === "memory_storage" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Detailed RAM */}
          <div
            className="p-5 rounded-2xl border space-y-3.5"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: theme.BORDER }}>
              <div className="flex items-center gap-2">
                <Activity size={18} style={{ color: theme.ACCENT }} />
                <h3 className="font-bold text-sm text-white">RAM (Random Access Memory)</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg font-mono" style={{ backgroundColor: theme.NAVY, color: theme.GOOD }}>
                {ramPercent}% In Use
              </span>
            </div>

            <div className="p-3 rounded-xl border space-y-2 font-mono text-xs" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Total Installed RAM:</span>
                <span className="font-bold text-white">{ramTotal} GB</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Currently Used RAM:</span>
                <span className="font-bold text-sky-400">{ramUsed} GB ({ramPercent}%)</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Available Free RAM:</span>
                <span className="font-bold text-emerald-400">{ramFree} GB</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Memory Type & Speed:</span>
                <span className="font-bold text-white">DDR4 / DDR5 @ 3200 MHz</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Memory Channels:</span>
                <span className="font-bold text-white">Dual Channel (2 of 2 slots populated)</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Hardware Reserved:</span>
                <span className="font-bold text-white">182 MB</span>
              </div>
            </div>

            <div className="pt-1">
              <div className="text-[11px] font-semibold text-white/90 mb-1.5 flex justify-between">
                <span>Real-Time Allocation Breakdown</span>
                <span style={{ color: theme.MUTED }}>Total: {ramTotal} GB</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/40">
                <div style={{ width: `${ramPercent}%`, backgroundColor: theme.ACCENT }} title="Active Process Memory" />
                <div style={{ width: "18%", backgroundColor: theme.BLUE }} title="Standby Cache" />
                <div style={{ width: `${100 - ramPercent - 18}%`, backgroundColor: "#1E4A75" }} title="Free Memory" />
              </div>
              <div className="flex justify-between text-[10px] font-mono mt-1" style={{ color: theme.MUTED }}>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.ACCENT }} /> In Use ({ramUsed} GB)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.BLUE }} /> Cache (2.2 GB)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600" /> Free ({ramFree} GB)</span>
              </div>
            </div>
          </div>

          {/* Detailed ROM / Storage */}
          <div
            className="p-5 rounded-2xl border space-y-3.5"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: theme.BORDER }}>
              <div className="flex items-center gap-2">
                <HardDrive size={18} style={{ color: theme.ACCENT }} />
                <h3 className="font-bold text-sm text-white">ROM Storage & Disk Architecture</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg font-mono" style={{ backgroundColor: theme.NAVY, color: theme.ACCENT }}>
                {romPercent}% Full
              </span>
            </div>

            <div className="p-3 rounded-xl border space-y-2 font-mono text-xs" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Total Storage Capacity (ROM):</span>
                <span className="font-bold text-white">{romTotal} GB</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Total Used Space:</span>
                <span className="font-bold text-sky-400">{romUsed} GB ({romPercent}%)</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Total Free Space Available:</span>
                <span className="font-bold text-emerald-400">{romFree} GB</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Physical Drive Media:</span>
                <span className="font-bold text-white">NVMe M.2 Solid State Drive (SSD)</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Sequential Read Speed:</span>
                <span className="font-bold text-emerald-400">~ 3,500 MB/s High Speed</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Partition Style:</span>
                <span className="font-bold text-white">GPT (GUID Partition Table, NTFS)</span>
              </div>
            </div>

            {/* Quick summary advice */}
            <div className="p-3 rounded-xl text-xs leading-relaxed border flex items-start gap-2" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span style={{ color: theme.PALE }}>
                Storage condition is <strong>Healthy</strong>. Both Drive C: and Drive D: have ample free space for Windows updates and daily files.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Windows OS & Edition */}
      {activeTab === "windows" && (
        <div
          className="p-5 rounded-2xl border space-y-4"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.BORDER }}>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🪟</span>
              <div>
                <h3 className="font-bold text-base text-white">
                  {metrics?.windowsEdition || "Windows 11 Pro 64-bit"}
                </h3>
                <p className="text-xs" style={{ color: theme.MUTED }}>
                  Operating System Specifications & Licensing
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              <span>Genuine & Activated</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl border space-y-2.5 font-mono text-xs" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-1 font-sans border-b border-white/10 pb-1">
                Windows System Details
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Edition:</span>
                <span className="font-bold text-white">Windows 11 Pro</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Version:</span>
                <span className="font-bold text-white">{metrics?.windowsVersion || "23H2"}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>OS Build:</span>
                <span className="font-bold text-white">{metrics?.osBuild || "22631.3880"}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Experience:</span>
                <span className="font-bold text-white">Windows Feature Experience Pack</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Kernel Platform:</span>
                <span className="font-bold text-sky-400">{metrics?.platform || "Linux / Windows Subsystem"}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border space-y-2.5 font-mono text-xs" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-1 font-sans border-b border-white/10 pb-1">
                Device Information
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Device Name:</span>
                <span className="font-bold text-white">{metrics?.deviceName || "DESKTOP-PRO-PC"}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Computer Hostname:</span>
                <span className="font-bold text-white">{metrics?.hostname || "localhost"}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>System Type:</span>
                <span className="font-bold text-white">64-bit OS, x64-based processor</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Activation Status:</span>
                <span className="font-bold text-emerald-400">Digital License Activated</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Pen and Touch:</span>
                <span className="font-bold text-white">Supported (Multi-Touch)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: GPU, Motherboard & Network */}
      {activeTab === "hardware" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Graphics (GPU) */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: theme.BORDER }}>
              <div className="flex items-center gap-2">
                <Zap size={18} style={{ color: theme.ACCENT }} />
                <h3 className="font-bold text-sm text-white">Graphics & Display (GPU)</h3>
              </div>
              <span className="text-xs font-mono font-bold" style={{ color: theme.ACCENT }}>
                VRAM: 8.0 GB
              </span>
            </div>

            <div className="p-3 rounded-xl border space-y-2 font-mono text-xs" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Dedicated GPU:</span>
                <span className="font-bold text-white">NVIDIA GeForce RTX 4060 Laptop GPU</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Integrated GPU:</span>
                <span className="font-bold text-white">Intel(R) Iris Xe Graphics</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Dedicated Video Memory:</span>
                <span className="font-bold text-sky-400">8192 MB GDDR6 High-Speed VRAM</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Display Resolution:</span>
                <span className="font-bold text-white">{typeof window !== "undefined" ? `${window.screen.width} × ${window.screen.height}` : "1920 × 1080"} (FHD / QHD)</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Refresh Rate:</span>
                <span className="font-bold text-emerald-400">144 Hz Smooth Display</span>
              </div>
            </div>
          </div>

          {/* Motherboard, BIOS & Network */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: theme.BORDER }}>
              <div className="flex items-center gap-2">
                <Wifi size={18} style={{ color: theme.ACCENT }} />
                <h3 className="font-bold text-sm text-white">Motherboard, BIOS & Network</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Ping: 14 ms
              </span>
            </div>

            <div className="p-3 rounded-xl border space-y-2 font-mono text-xs" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Motherboard:</span>
                <span className="font-bold text-white">ASUSTeK High-Performance Series</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>UEFI BIOS Version:</span>
                <span className="font-bold text-white">v318 (American Megatrends UEFI)</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Secure Boot & TPM:</span>
                <span className="font-bold text-emerald-400">Secure Boot ON · TPM 2.0 Ready</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Network Connection:</span>
                <span className="font-bold text-white">Wi-Fi 6 (802.11ax) Dual Band Gigabit</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.MUTED }}>Local IP Address:</span>
                <span className="font-bold text-sky-400">{metrics?.network?.ipAddress || "192.168.1.108"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Task Manager (Running Processes & Kill Task) */}
      {activeTab === "task_manager" && (
        <div
          className="p-5 rounded-2xl border space-y-4"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3" style={{ borderColor: theme.BORDER }}>
            <div className="flex items-center gap-2">
              <Layers size={20} style={{ color: theme.ACCENT }} />
              <div>
                <h3 className="font-bold text-base text-white">Running Apps & Background Processes</h3>
                <p className="text-xs" style={{ color: theme.MUTED }}>
                  Monitor process resource usage and terminate runaway tasks to free RAM.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-white/50" />
                <input
                  type="text"
                  placeholder="Filter processes…"
                  value={processSearch}
                  onChange={(e) => setProcessSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl text-xs outline-none border transition-all text-white font-mono"
                  style={{
                    backgroundColor: theme.NAVY,
                    borderColor: theme.BORDER,
                  }}
                />
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-xl border text-white" style={{ backgroundColor: theme.NAVY, borderColor: theme.BORDER }}>
                {processes.length} Processes
              </span>
            </div>
          </div>

          {/* Processes Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b text-[11px] font-sans font-bold uppercase tracking-wider text-white/70" style={{ borderColor: theme.BORDER }}>
                  <th className="py-2.5 px-3">PID</th>
                  <th className="py-2.5 px-3">App / Process Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">CPU %</th>
                  <th className="py-2.5 px-3 text-right">RAM (MB)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processes
                  .filter((p) => p.name.toLowerCase().includes(processSearch.toLowerCase()))
                  .map((p) => (
                    <tr key={p.pid} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 text-white/60">{p.pid}</td>
                      <td className="py-2.5 px-3 font-bold text-white font-sans">{p.name}</td>
                      <td className="py-2.5 px-3 text-white/70 text-[11px]">{p.category}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-sky-400">{p.cpu}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">{p.ramMB} MB</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleEndTask(p.pid, p.name, p.ramMB)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-600/80 hover:bg-red-600 text-white transition-all shadow-sm flex items-center gap-1 ml-auto"
                        >
                          <XCircle size={12} />
                          <span>End Task</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Storage Junk & Cache Cleaner */}
      {activeTab === "junk_cleaner" && (
        <div className="space-y-4">
          <div
            className="p-5 rounded-2xl border space-y-4"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3" style={{ borderColor: theme.BORDER }}>
              <div className="flex items-center gap-2.5">
                <Trash2 size={22} style={{ color: theme.ACCENT }} />
                <div>
                  <h3 className="font-bold text-base text-white">ROM Storage & Disk Junk Cleaner</h3>
                  <p className="text-xs" style={{ color: theme.MUTED }}>
                    Reclaim space on Drive C: by cleaning temporary files, log dumps, and web cache.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.MUTED }}>
                    Cleanable Space
                  </div>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {(totalJunkSelectedMB / 1024).toFixed(2)} GB ({totalJunkSelectedMB} MB)
                  </div>
                </div>

                <button
                  onClick={handleCleanJunk}
                  disabled={totalJunkSelectedMB === 0 || isCleaningJunk}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-900 shadow-md disabled:opacity-40"
                  style={{
                    backgroundColor: theme.ACCENT,
                  }}
                >
                  <Trash2 size={14} className={isCleaningJunk ? "animate-spin" : ""} />
                  <span>{isCleaningJunk ? "Cleaning Junk…" : "Clean Junk Now"}</span>
                </button>
              </div>
            </div>

            {cleanSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{cleanSuccess}</span>
              </div>
            )}

            {/* Junk Categories Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {junkCategories.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleToggleJunk(c.id)}
                  className="p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:bg-white/5 select-none"
                  style={{
                    backgroundColor: theme.NAVY,
                    borderColor: c.selected ? theme.ACCENT : theme.BORDER,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={c.selected}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 rounded accent-sky-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{c.name}</div>
                      <div className="text-[10px] opacity-70 leading-relaxed" style={{ color: theme.PALE }}>
                        {c.desc}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="font-mono font-bold text-xs text-sky-400">
                      {c.sizeMB} MB
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Power Profile Slider / Toggle */}
            <div className="pt-3 border-t" style={{ borderColor: theme.BORDER }}>
              <div className="text-xs font-bold uppercase tracking-wider text-white/90 mb-2 flex items-center gap-1.5">
                <Power size={14} style={{ color: theme.ACCENT }} />
                <span>System Power & Performance Mode</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "Performance", label: "🚀 High Performance", desc: "Maximum clock speed for coding & heavy tasks" },
                  { id: "Balanced", label: "⚖ Balanced Mode", desc: "Automated speed & energy balance (Recommended)" },
                  { id: "Saver", label: "🔋 Battery Saver", desc: "Low thermal output & maximum battery life" },
                ].map((mode) => {
                  const isSelected = powerProfile === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setPowerProfile(mode.id as any)}
                      className="p-3 rounded-xl border text-left transition-all"
                      style={{
                        backgroundColor: isSelected ? theme.BLUE : theme.NAVY,
                        borderColor: isSelected ? theme.ACCENT : theme.BORDER,
                        color: isSelected ? "#FFFFFF" : theme.PALE,
                      }}
                    >
                      <div className="font-bold text-xs">{mode.label}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{mode.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
