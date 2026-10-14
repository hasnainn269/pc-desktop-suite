import React, { useState, useEffect } from "react";
import { ThemeColors } from "../types/theme";
import { Note } from "../types/assistant";
import { GradientBanner } from "./GradientBanner";
import {
  Plus,
  Save,
  Trash2,
  Download,
  Check,
  AlertCircle,
  X,
} from "lucide-react";

interface NotesViewProps {
  theme: ThemeColors;
  notes: Note[];
  onSaveNote: (note: { id?: string; title: string; content: string }) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  theme,
  notes,
  onSaveNote,
  onDeleteNote,
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [title, setTitle] = useState(notes[0]?.title || "");
  const [content, setContent] = useState(notes[0]?.content || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  // Select first note on initial load if none selected
  useEffect(() => {
    if (activeNoteId) {
      const found = notes.find((n) => n.id === activeNoteId);
      if (found) {
        setTitle(found.title);
        setContent(found.content);
      }
    } else if (notes.length > 0 && activeNoteId === null) {
      setActiveNoteId(notes[0].id);
      setTitle(notes[0].title);
      setContent(notes[0].content);
    }
  }, [activeNoteId, notes]);

  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeNoteId, title, content]);

  const handleSelectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setStatusMessage("");
  };

  const handleSave = () => {
    const trimmedTitle = title.trim() || "Untitled Note";
    onSaveNote({
      id: activeNoteId || undefined,
      title: trimmedTitle,
      content,
    });
    const now = new Date().toLocaleTimeString();
    setStatusMessage(`Saved ✓ ${now}`);
    setTimeout(() => setStatusMessage(""), 3500);
  };

  const handleNew = () => {
    setActiveNoteId(null);
    setTitle("");
    setContent("");
    setStatusMessage("New note ready.");
  };

  const handleDeletePrompt = () => {
    if (!activeNoteId) {
      setStatusMessage("Select a note from the left list to delete.");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }
    setConfirmDeleteModal(true);
  };

  const executeDelete = () => {
    if (activeNoteId) {
      onDeleteNote(activeNoteId);
      setConfirmDeleteModal(false);
      handleNew();
      setStatusMessage("Note deleted successfully.");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleExport = () => {
    const filename = `${title.trim() || "Note"}.txt`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  });

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="space-y-4">
      <GradientBanner
        title="Notes"
        subtitle="Manage personal notes, quick ideas, and code snippets offline."
        theme={theme}
      />

      {/* Delete Confirmation Modal */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-2xl border p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-white">Delete Note?</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-white">"{title || "Untitled"}"</strong>? This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setConfirmDeleteModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-white/10">
              <button
                onClick={() => setConfirmDeleteModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-white/20 text-slate-300 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-900/40"
              >
                Yes, Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      {statusMessage && (
        <div
          className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
            color: theme.ACCENT,
          }}
        >
          <span>{statusMessage}</span>
          <span className="text-[10px] opacity-75">Ctrl+S to save</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Note List & Search */}
        <div className="md:col-span-4 flex flex-col h-[520px]">
          {/* Search bar */}
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search notes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs outline-none border transition-all"
              style={{
                backgroundColor: theme.CARD,
                borderColor: theme.BORDER,
                color: "#FFFFFF",
              }}
            />
          </div>

          {/* List of notes */}
          <div
            className="flex-1 overflow-y-auto rounded-2xl border p-2 space-y-1"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            {filteredNotes.length === 0 ? (
              <div
                className="text-xs text-center py-8 font-medium"
                style={{ color: theme.MUTED }}
              >
                {searchQuery ? "No matching notes found." : "No notes yet. Click New to create one!"}
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <button
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className="w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all"
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
                    <div className="truncate flex items-center gap-2">
                      <span>📝</span>
                      <span className="truncate">{note.title}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="md:col-span-8 flex flex-col h-[520px]">
          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <input
              type="text"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 min-w-[180px] px-3.5 py-2 rounded-xl text-sm font-semibold outline-none border transition-all"
              style={{
                backgroundColor: theme.CARD,
                borderColor: theme.BORDER,
                color: "#FFFFFF",
              }}
            />

            <button
              onClick={handleNew}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all"
              style={{
                borderColor: theme.BORDER,
                backgroundColor: "transparent",
                color: theme.PALE,
              }}
            >
              <Plus size={14} /> New
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              style={{
                backgroundColor: theme.ACCENT,
                color: theme.NAVY,
              }}
            >
              <Save size={14} /> Save
            </button>

            <button
              onClick={handleDeletePrompt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-600/80 hover:bg-red-600 text-white transition-all"
            >
              <Trash2 size={14} /> Delete
            </button>

            <button
              onClick={handleExport}
              title="Export as .txt"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all"
              style={{
                borderColor: theme.BORDER,
                backgroundColor: "transparent",
                color: theme.PALE,
              }}
            >
              <Download size={14} /> Export
            </button>
          </div>

          {/* Text Area */}
          <div
            className="flex-1 rounded-2xl border p-3.5 flex flex-col relative"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <textarea
              placeholder="Start typing your note here... (Press Ctrl + S to save at any time)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 bg-transparent resize-none outline-none text-xs leading-relaxed font-sans"
              style={{ color: "#FFFFFF" }}
            />

            {/* Bottom info: character and word count */}
            <div
              className="pt-2 mt-2 border-t flex items-center justify-between text-[11px]"
              style={{
                borderColor: theme.BORDER,
                color: theme.MUTED,
              }}
            >
              <span className="flex items-center gap-1.5">
                <Check size={12} className="text-emerald-400" />
                Auto-indexed offline
              </span>
              <span>
                {wordCount} words · {charCount} characters
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
