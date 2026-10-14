import React, { useState, useEffect } from "react";
import { ThemeColors } from "../types/theme";
import { TodoItem } from "../types/assistant";
import { GradientBanner } from "./GradientBanner";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  Zap,
  Check,
  Calendar,
} from "lucide-react";

interface TasksFocusViewProps {
  theme: ThemeColors;
  tasks: TodoItem[];
  onAddTask: (task: Omit<TodoItem, "id" | "createdAt">) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksFocusView: React.FC<TasksFocusViewProps> = ({
  theme,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  // Tabs: Tasks vs Pomodoro
  const [activeTab, setActiveTab] = useState<"todo" | "pomodoro">("todo");

  // To-do form state
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newCategory, setNewCategory] = useState<"Work" | "Personal" | "Study" | "System">("Work");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Pomodoro state
  const [pomoMode, setPomoMode] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Timer duration per mode
  const modeDurations = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const handleModeChange = (mode: "work" | "shortBreak" | "longBreak") => {
    setPomoMode(mode);
    setTimeLeft(modeDurations[mode]);
    setIsRunning(false);
  };

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      // Play audio notification
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
        setTimeout(() => osc.stop(), 1200);
      } catch (e) {
        // ignore audio context failures
      }

      if (pomoMode === "work") {
        setSessionsCompleted((s) => s + 1);
        handleModeChange("shortBreak");
      } else {
        handleModeChange("work");
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, pomoMode]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle.trim(),
      completed: false,
      priority: newPriority,
      category: newCategory,
    });
    setNewTitle("");
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (categoryFilter === "All") return true;
    return t.category === categoryFilter;
  });

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getPriorityBadge = (p: "High" | "Medium" | "Low") => {
    if (p === "High") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
          <Flame size={11} className="text-red-400" /> High
        </span>
      );
    }
    if (p === "Medium") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <Zap size={11} className="text-amber-400" /> Medium
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
        Low
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <GradientBanner
        title="Tasks & Pomodoro Focus"
        subtitle="Organize daily priorities, manage tasks, and boost productivity with 25-minute Pomodoro focus blocks."
        theme={theme}
      />

      {/* Tabs */}
      <div
        className="p-1 rounded-xl border flex gap-1 w-fit"
        style={{
          backgroundColor: theme.CARD,
          borderColor: theme.BORDER,
        }}
      >
        <button
          onClick={() => setActiveTab("todo")}
          className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          style={{
            backgroundColor: activeTab === "todo" ? theme.BLUE : "transparent",
            color: activeTab === "todo" ? "#FFFFFF" : theme.PALE,
          }}
        >
          <CheckCircle2 size={14} />
          <span>To-Do Planner ({completedCount}/{tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pomodoro")}
          className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          style={{
            backgroundColor: activeTab === "pomodoro" ? theme.BLUE : "transparent",
            color: activeTab === "pomodoro" ? "#FFFFFF" : theme.PALE,
          }}
        >
          <Clock size={14} />
          <span>Pomodoro Timer ({formatTimer(timeLeft)})</span>
        </button>
      </div>

      {/* Tab 1: To-Do Planner */}
      {activeTab === "todo" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Left: Task Creator & Categories */}
          <div
            className="md:col-span-5 p-5 rounded-2xl border space-y-4 h-fit"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: theme.BORDER }}>
              <div className="flex items-center gap-2">
                <Sparkles size={18} style={{ color: theme.ACCENT }} />
                <h3 className="font-bold text-sm text-white">Add New Task</h3>
              </div>
              <span className="text-[11px] font-mono" style={{ color: theme.MUTED }}>
                {progressPercent}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-[11px] mb-1 font-mono" style={{ color: theme.MUTED }}>
                <span>Daily Completion</span>
                <span className="font-bold text-white">{completedCount} of {tasks.length} done</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.NAVY }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: theme.GOOD,
                  }}
                />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Finish Python AI Assistant code..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs outline-none border transition-all text-white"
                  style={{
                    backgroundColor: theme.NAVY,
                    borderColor: theme.BORDER,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl text-xs outline-none border text-white font-semibold cursor-pointer"
                    style={{
                      backgroundColor: theme.NAVY,
                      borderColor: theme.BORDER,
                    }}
                  >
                    <option value="High" className="bg-slate-900">🔥 High</option>
                    <option value="Medium" className="bg-slate-900">⚡ Medium</option>
                    <option value="Low" className="bg-slate-900">🟢 Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl text-xs outline-none border text-white font-semibold cursor-pointer"
                    style={{
                      backgroundColor: theme.NAVY,
                      borderColor: theme.BORDER,
                    }}
                  >
                    <option value="Work" className="bg-slate-900">Work</option>
                    <option value="Personal" className="bg-slate-900">Personal</option>
                    <option value="Study" className="bg-slate-900">Study</option>
                    <option value="System" className="bg-slate-900">System</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-40"
                style={{
                  backgroundColor: theme.ACCENT,
                  color: theme.NAVY,
                }}
              >
                <Plus size={15} />
                <span>Add To Daily Tasks</span>
              </button>
            </form>
          </div>

          {/* Right: Tasks List */}
          <div
            className="md:col-span-7 p-5 rounded-2xl border space-y-3.5 flex flex-col h-[520px]"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            {/* Header & Category Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: theme.BORDER }}>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {["All", "Work", "Personal", "Study", "System"].map((cat) => {
                  const isSel = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: isSel ? theme.BLUE : "transparent",
                        color: isSel ? "#FFFFFF" : theme.MUTED,
                        border: `1px solid ${isSel ? theme.ACCENT : theme.BORDER}`,
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] font-mono text-white/70">
                {filteredTasks.length} task(s)
              </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-24 text-xs" style={{ color: theme.MUTED }}>
                  No tasks in this category. Add a task on the left!
                </div>
              ) : (
                filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all hover:bg-white/5"
                    style={{
                      backgroundColor: theme.NAVY,
                      borderColor: t.completed ? theme.BORDER : theme.BORDER,
                    }}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <button
                        onClick={() => onToggleTask(t.id)}
                        className="text-white hover:scale-110 transition-transform shrink-0"
                      >
                        {t.completed ? (
                          <CheckCircle2 size={19} className="text-emerald-400" />
                        ) : (
                          <Circle size={19} className="text-white/40" />
                        )}
                      </button>

                      <div className="truncate">
                        <span
                          className={`text-xs font-semibold block truncate ${
                            t.completed ? "line-through text-white/40" : "text-white"
                          }`}
                        >
                          {t.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px]" style={{ color: theme.MUTED }}>
                          <span>{t.category}</span>
                          <span>•</span>
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {getPriorityBadge(t.priority)}

                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="text-white/40 hover:text-red-400 p-1 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pomodoro Focus Timer */}
      {activeTab === "pomodoro" && (
        <div
          className="p-8 rounded-2xl border max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-6"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          {/* Mode Switcher */}
          <div
            className="p-1 rounded-xl border flex gap-1"
            style={{
              backgroundColor: theme.NAVY,
              borderColor: theme.BORDER,
            }}
          >
            {[
              { id: "work", label: "🎯 Focus Work (25m)" },
              { id: "shortBreak", label: "☕ Short Break (5m)" },
              { id: "longBreak", label: "🌴 Long Break (15m)" },
            ].map((m) => {
              const isSel = pomoMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id as any)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    backgroundColor: isSel ? theme.BLUE : "transparent",
                    color: isSel ? "#FFFFFF" : theme.PALE,
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Big Timer Display */}
          <div className="relative py-4 flex flex-col items-center justify-center">
            <div
              className="text-7xl font-bold font-mono tracking-wider text-white drop-shadow-md select-none"
              style={{ color: pomoMode === "work" ? theme.ACCENT : theme.GOOD }}
            >
              {formatTimer(timeLeft)}
            </div>
            <div className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: theme.MUTED }}>
              {pomoMode === "work" ? "Deep Focus Session" : "Rest & Recharge Session"}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95"
              style={{
                backgroundColor: isRunning ? "#EF4444" : theme.ACCENT,
                color: isRunning ? "#FFFFFF" : theme.NAVY,
              }}
            >
              {isRunning ? (
                <>
                  <Pause size={17} />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play size={17} />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(modeDurations[pomoMode]);
              }}
              className="p-3 rounded-xl border flex items-center justify-center transition-all text-white/70 hover:text-white"
              style={{
                backgroundColor: theme.NAVY,
                borderColor: theme.BORDER,
              }}
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Daily Streak & Sessions Completed */}
          <div
            className="p-3.5 rounded-xl border w-full flex items-center justify-between text-xs font-mono"
            style={{
              backgroundColor: theme.NAVY,
              borderColor: theme.BORDER,
            }}
          >
            <span style={{ color: theme.MUTED }}>Focus Blocks Completed Today:</span>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span className="text-amber-400">🍅 × {sessionsCompleted}</span>
              <span>({sessionsCompleted * 25} minutes total)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
