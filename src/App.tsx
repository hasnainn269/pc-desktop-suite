import React, { useState, useEffect } from "react";
import { THEMES, ThemeName, ThemeColors } from "./types/theme";
import { Note, FileItem, PDFDocument, SystemMetrics, CalcHistoryItem, TodoItem, VaultCredential } from "./types/assistant";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { NotesView } from "./components/NotesView";
import { TasksFocusView } from "./components/TasksFocusView";
import { SecretVaultView } from "./components/SecretVaultView";
import { FileManagerView } from "./components/FileManagerView";
import { PCMonitorView } from "./components/PCMonitorView";
import { CalculatorView } from "./components/CalculatorView";
import { PDFStudioView } from "./components/PDFStudioView";
import { PythonScriptModal } from "./components/PythonScriptModal";
import { WindowsTitleBar } from "./components/WindowsTitleBar";
import { WindowsAppModal } from "./components/WindowsAppModal";
import { usePWAInstall } from "./hooks/usePWAInstall";

// Initial Windows Desktop Notes
const INITIAL_NOTES: Note[] = [
  {
    id: "note-1",
    title: "Windows Laptop Setup Guide",
    content:
      "Welcome to PC Desktop Suite — Windows Edition!\n\nThis application is designed specifically for Windows laptops and desktop workstations:\n• 1-Click Windows App Installation: Pins to Windows Taskbar & Start Menu\n• Instant Offline Mode: Runs anywhere without requiring an active internet connection\n• Live PC Hardware Diagnostics: CPU loads, RAM memory bars, and C: & D: ROM drives\n• Secure Local Storage: All notes, vault keys and tasks remain private on this laptop\n• High Performance Utilities: Scientific calculator, document studio & file explorer\n\nEnjoy using your personal Windows workspace!",
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: "note-2",
    title: "Windows Keyboard Shortcuts",
    content:
      "Productive Shortcuts:\n• F11: Toggle borderless Fullscreen Window\n• Ctrl + S: Save note in editor\n• Enter: Calculate math expression or insert new task\n• Alt + Tab: Switch back and forth between Windows apps\n• Download .bat: Run the desktop launcher directly from your desktop",
    updatedAt: Date.now() - 3600000,
  },
  {
    id: "note-3",
    title: "Project Checklist",
    content:
      "1. Verify C: Drive free space before downloading large files\n2. Review high-priority project tasks in Tasks & Focus\n3. Store API credentials and account passkeys securely in Secret Vault\n4. Extract text from contract PDFs in PDF Studio",
    updatedAt: Date.now() - 1800000,
  },
];

// Initial mock files
const INITIAL_FILES: FileItem[] = [
  { id: "f-1", name: "Documents", path: "/Documents", isDir: true },
  { id: "f-2", name: "Notes", path: "/Notes", isDir: true },
  { id: "f-3", name: "Code", path: "/Code", isDir: true },
  { id: "f-4", name: "Downloads", path: "/Downloads", isDir: true },
  {
    id: "f-5",
    name: "Run-PC-Desktop-Suite.bat",
    path: "/Downloads/Run-PC-Desktop-Suite.bat",
    isDir: false,
    size: 580,
    content: `@echo off\ntitle PC Desktop Suite - Windows App\nstart msedge.exe --app="http://localhost:3000" --window-size=1280,820\nexit`,
  },
  {
    id: "f-6",
    name: "personal_assistant.py",
    path: "/Code/personal_assistant.py",
    isDir: false,
    size: 28400,
    content: `# Personal AI Assistant - Python CustomTkinter Desktop Code\n# Run with: python personal_assistant.py\nprint("PC Desktop Suite Starting...")`,
  },
  {
    id: "f-7",
    name: "system_config.json",
    path: "/Documents/system_config.json",
    isDir: false,
    size: 1420,
    content: `{\n  "version": "3.0.0",\n  "platform": "Windows 11 x64",\n  "autoSave": true,\n  "offlineMode": true\n}`,
  },
];

// Initial mock PDFs
const INITIAL_PDFS: PDFDocument[] = [
  {
    id: "pdf-1",
    name: "Windows_App_User_Manual.pdf",
    path: "~/Documents/Windows_App_User_Manual.pdf",
    pages: 4,
    wordCount: 380,
    text: `Page 1:\nPC DESKTOP SUITE - WINDOWS EDITION SPECIFICATION\nOverview: A dual desktop & web productivity hub engineered for high performance, local privacy, and low latency.\n\nPage 2:\nWINDOWS HARDWARE DIAGNOSTICS\n- Real-time CPU multi-core load evaluation\n- Live RAM consumption monitor\n- Storage ROM capacity breakdown for C: and D: partitions\n\nPage 3:\nOFFLINE PERSISTENCE\nAll databases, credentials, and notes are cached locally on your device storage.\n\nPage 4:\nPORTABLE RUNNER\nSupports standalone execution via Microsoft Edge/Chrome app mode or Python CustomTkinter.`,
  },
  {
    id: "pdf-2",
    name: "Python_CustomTkinter_Guide.pdf",
    path: "~/Documents/Python_CustomTkinter_Guide.pdf",
    pages: 3,
    wordCount: 290,
    text: `Page 1:\nCUSTOMTKINTER FOR WINDOWS\nCustomTkinter enables modern high-DPI scaling, acrylic dark themes, rounded cards, and smooth window geometry.\n\nPage 2:\nSYSTEM TRAY & DESKTOP LAUNCHERS\nCompile python files using pyinstaller --noconsole --onefile personal_assistant.py for Windows deployment.`,
  },
];

// Initial mock Tasks
const INITIAL_TASKS: TodoItem[] = [
  {
    id: "task-1",
    title: "Check System Specs (RAM & C: Drive storage)",
    completed: true,
    priority: "High",
    category: "System",
    createdAt: Date.now() - 7200000,
  },
  {
    id: "task-2",
    title: "Install PC Desktop Suite as Windows Desktop App",
    completed: false,
    priority: "High",
    category: "System",
    createdAt: Date.now() - 3600000,
  },
  {
    id: "task-3",
    title: "Backup project notes & export important documents",
    completed: false,
    priority: "Medium",
    category: "Work",
    createdAt: Date.now() - 1800000,
  },
  {
    id: "task-4",
    title: "Setup master password in Secret Vault",
    completed: true,
    priority: "High",
    category: "Personal",
    createdAt: Date.now() - 900000,
  },
];

// Initial mock Vault items
const INITIAL_VAULT: VaultCredential[] = [
  {
    id: "vault-1",
    title: "Windows Laptop Master PIN",
    username: "Administrator",
    password: "PIN_942081#WinSec",
    category: "Work",
    updatedAt: Date.now() - 86400000,
  },
  {
    id: "vault-2",
    title: "Workspace Account",
    username: "hasnainkhanxx751@gmail.com",
    password: "SecurePass#2026_ProVault!",
    category: "Work",
    updatedAt: Date.now() - 43200000,
  },
  {
    id: "vault-3",
    title: "Home Wi-Fi 6 Router",
    username: "admin",
    password: "WPA3_GigaBitKey#992",
    category: "API Keys",
    updatedAt: Date.now() - 21600000,
  },
];

export default function App() {
  // Theme state
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("assistant_theme");
    return saved && THEMES[saved as ThemeName] ? (saved as ThemeName) : "Ocean Blue";
  });
  const theme: ThemeColors = THEMES[themeName];

  // Current page
  const [currentPage, setCurrentPage] = useState<string>("Dashboard");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Modals state
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isWindowsAppModalOpen, setIsWindowsAppModalOpen] = useState(false);

  // PWA Install hook
  const { canInstall, isInstalled, installApp } = usePWAInstall();

  // Notes state
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem("assistant_notes");
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  // Files state
  const [files, setFiles] = useState<FileItem[]>(() => {
    try {
      const saved = localStorage.getItem("assistant_files");
      return saved ? JSON.parse(saved) : INITIAL_FILES;
    } catch {
      return INITIAL_FILES;
    }
  });

  // PDF Catalog state
  const [pdfList, setPdfList] = useState<PDFDocument[]>(() => {
    try {
      const saved = localStorage.getItem("assistant_pdfs");
      return saved ? JSON.parse(saved) : INITIAL_PDFS;
    } catch {
      return INITIAL_PDFS;
    }
  });

  // Calculator History state
  const [calcHistory, setCalcHistory] = useState<CalcHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("assistant_calc_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Live System Telemetry state
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLiveMonitor, setIsLiveMonitor] = useState(true);

  // Tasks state
  const [tasks, setTasks] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem("assistant_todos");
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Vault credentials state
  const [credentials, setCredentials] = useState<VaultCredential[]>(() => {
    try {
      const saved = localStorage.getItem("assistant_vault");
      return saved ? JSON.parse(saved) : INITIAL_VAULT;
    } catch {
      return INITIAL_VAULT;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("assistant_theme", themeName);
  }, [themeName]);

  useEffect(() => {
    localStorage.setItem("assistant_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("assistant_files", JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem("assistant_pdfs", JSON.stringify(pdfList));
  }, [pdfList]);

  useEffect(() => {
    localStorage.setItem("assistant_calc_history", JSON.stringify(calcHistory));
  }, [calcHistory]);

  useEffect(() => {
    localStorage.setItem("assistant_todos", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("assistant_vault", JSON.stringify(credentials));
  }, [credentials]);

  // Fetch telemetry
  const fetchSystemInfo = async () => {
    try {
      const res = await fetch("/api/system-info");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch {
      // offline fallback handled by sw or cached
    }
  };

  useEffect(() => {
    fetchSystemInfo();
    if (!isLiveMonitor) return;
    const interval = setInterval(fetchSystemInfo, 2000);
    return () => clearInterval(interval);
  }, [isLiveMonitor]);

  // Page navigation with smooth transition
  const navigateTo = (page: string) => {
    if (page === currentPage) return;
    setIsTransitioning(true);
    setCurrentPage(page);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  // Note actions
  const handleSaveNote = (noteData: { id?: string; title: string; content: string }) => {
    setNotes((prev) => {
      if (noteData.id) {
        return prev.map((n) =>
          n.id === noteData.id
            ? { ...n, title: noteData.title, content: noteData.content, updatedAt: Date.now() }
            : n
        );
      }
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: noteData.title,
        content: noteData.content,
        updatedAt: Date.now(),
      };
      return [newNote, ...prev];
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // File actions
  const handleUploadFile = (fileItem: FileItem) => {
    setFiles((prev) => [fileItem, ...prev]);
  };

  // PDF actions
  const handleAddPDF = (doc: PDFDocument) => {
    setPdfList((prev) => [doc, ...prev]);
  };

  // Task actions
  const handleAddTask = (taskData: Omit<TodoItem, "id" | "createdAt">) => {
    const newTask: TodoItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Vault actions
  const handleAddCredential = (credData: Omit<VaultCredential, "id" | "updatedAt">) => {
    const newCred: VaultCredential = {
      ...credData,
      id: `vault-${Date.now()}`,
      updatedAt: Date.now(),
    };
    setCredentials((prev) => [newCred, ...prev]);
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden font-sans select-none antialiased transition-colors duration-300"
      style={{ backgroundColor: theme.NAVY }}
    >
      {/* Windows 11 Desktop Titlebar Controls Header */}
      <WindowsTitleBar
        theme={theme}
        currentPage={currentPage}
        metrics={metrics}
        canInstall={canInstall}
        isInstalled={isInstalled}
        onOpenWindowsHub={() => setIsWindowsAppModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={navigateTo}
          currentTheme={themeName}
          onThemeChange={setThemeName}
          theme={theme}
          onOpenPythonModal={() => setIsPythonModalOpen(true)}
          onOpenWindowsHub={() => setIsWindowsAppModalOpen(true)}
          isInstalled={isInstalled}
          isInstallable={canInstall}
          onInstallPWA={installApp}
        />

        {/* Content Area */}
        <main className="flex-1 h-full overflow-y-auto p-4 md:p-6 transition-all duration-300">
          <div
            className={`h-full transition-all duration-200 ease-out transform ${
              isTransitioning ? "opacity-40 translate-x-3" : "opacity-100 translate-x-0"
            }`}
          >
            {currentPage === "Dashboard" && (
              <Dashboard
                theme={theme}
                notesCount={notes.length}
                metrics={metrics}
                onNavigate={navigateTo}
                onOpenWindowsHub={() => setIsWindowsAppModalOpen(true)}
                isInstalled={isInstalled}
                isInstallable={canInstall}
                onInstallPWA={installApp}
              />
            )}

            {currentPage === "Notes" && (
              <NotesView
                theme={theme}
                notes={notes}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
              />
            )}

            {currentPage === "Tasks & Focus" && (
              <TasksFocusView
                theme={theme}
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {currentPage === "Secret Vault" && (
              <SecretVaultView
                theme={theme}
                credentials={credentials}
                onAddCredential={handleAddCredential}
                onDeleteCredential={handleDeleteCredential}
              />
            )}

            {currentPage === "File Manager" && (
              <FileManagerView
                theme={theme}
                files={files}
                onUploadFile={handleUploadFile}
              />
            )}

            {(currentPage === "Computer Specs" || currentPage === "PC Monitor") && (
              <PCMonitorView
                theme={theme}
                metrics={metrics}
                isLive={isLiveMonitor}
                onToggleLive={() => setIsLiveMonitor((v) => !v)}
                onRefresh={fetchSystemInfo}
              />
            )}

            {currentPage === "Calculator" && (
              <CalculatorView
                theme={theme}
                calcHistory={calcHistory}
                onAddHistory={(item) => setCalcHistory((prev) => [item, ...prev.slice(0, 49)])}
                onClearHistory={() => setCalcHistory([])}
              />
            )}

            {currentPage === "PDF Studio" && (
              <PDFStudioView
                theme={theme}
                pdfList={pdfList}
                onAddPDF={handleAddPDF}
              />
            )}
          </div>
        </main>
      </div>

      {/* Windows App Hub & Installer Modal */}
      <WindowsAppModal
        theme={theme}
        isOpen={isWindowsAppModalOpen}
        onClose={() => setIsWindowsAppModalOpen(false)}
        isInstallable={canInstall}
        isInstalled={isInstalled}
        onInstallPWA={installApp}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
      />

      {/* Python Desktop Script Modal */}
      {isPythonModalOpen && (
        <PythonScriptModal
          theme={theme}
          onClose={() => setIsPythonModalOpen(false)}
        />
      )}
    </div>
  );
}
