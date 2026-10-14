import React, { useState } from "react";
import { ThemeColors } from "../types/theme";
import { FileItem } from "../types/assistant";
import { GradientBanner } from "./GradientBanner";
import { Folder, FileText, ArrowUp, Upload, Eye, X, Download } from "lucide-react";

interface FileManagerViewProps {
  theme: ThemeColors;
  files: FileItem[];
  onUploadFile: (file: FileItem) => void;
}

export const FileManagerView: React.FC<FileManagerViewProps> = ({
  theme,
  files,
  onUploadFile,
}) => {
  const [currentPath, setCurrentPath] = useState("/");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Folder navigation logic
  const handleFolderClick = (folderPath: string) => {
    setIsSearching(false);
    setCurrentPath(folderPath);
    setSelectedFile(null);
  };

  const handleUp = () => {
    if (currentPath === "/") return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const newPath = parts.length === 0 ? "/" : `/${parts.join("/")}`;
    setCurrentPath(newPath);
    setSelectedFile(null);
    setIsSearching(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    setSelectedFile(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    const reader = new FileReader();
    reader.onload = () => {
      const textContent = typeof reader.result === "string" ? reader.result : "";
      const newFile: FileItem = {
        id: `user-${Date.now()}`,
        name: uploaded.name,
        path: currentPath === "/" ? `/${uploaded.name}` : `${currentPath}/${uploaded.name}`,
        isDir: false,
        size: uploaded.size,
        updatedAt: Date.now(),
        content: textContent,
      };
      onUploadFile(newFile);
      setSelectedFile(newFile);
    };
    reader.readAsText(uploaded);
  };

  // Determine items to display
  let displayItems: FileItem[] = [];
  if (isSearching && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    displayItems = files.filter((f) => {
      if (q === "pdf") return f.name.toLowerCase().endsWith(".pdf");
      if (q.startsWith(".")) return f.name.toLowerCase().endsWith(q);
      return f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q);
    });
  } else {
    // Current directory items
    displayItems = files.filter((f) => {
      if (currentPath === "/") {
        const parts = f.path.split("/").filter(Boolean);
        return parts.length === 1;
      }
      return f.path.startsWith(currentPath + "/") && f.path.replace(currentPath + "/", "").indexOf("/") === -1;
    });
  }

  return (
    <div className="space-y-4">
      <GradientBanner
        title="File Manager"
        subtitle="Search by filename or browse folders. Click a file to select, folder to enter."
        theme={theme}
      />

      {/* Top Search & Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search filename (e.g. notes, .py, .txt, or pdf)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 min-w-[220px] px-3.5 py-2 rounded-xl text-sm outline-none border transition-all"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
            color: "#FFFFFF",
          }}
        />

        <button
          onClick={handleSearch}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
          style={{
            backgroundColor: theme.ACCENT,
            color: theme.NAVY,
          }}
        >
          🔎 Search
        </button>

        <label
          className="px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer border flex items-center gap-1.5 transition-all"
          style={{
            borderColor: theme.BORDER,
            backgroundColor: theme.CARD,
            color: theme.PALE,
          }}
        >
          <Upload size={14} /> Upload
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>

        <button
          onClick={handleUp}
          disabled={currentPath === "/" && !isSearching}
          className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1 transition-all disabled:opacity-40"
          style={{
            borderColor: theme.BORDER,
            backgroundColor: "transparent",
            color: theme.PALE,
          }}
        >
          <ArrowUp size={14} /> Up
        </button>
      </div>

      {/* Actions and Status Bar */}
      <div
        className="p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs"
        style={{
          backgroundColor: theme.CARD,
          borderColor: theme.BORDER,
        }}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-white/90">
            {isSearching ? `Search results for "${searchQuery}":` : `📂 ${currentPath}`}
          </span>
          {selectedFile && (
            <span style={{ color: theme.ACCENT }}>
              · Selected: {selectedFile.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedFile && !selectedFile.isDir && (
            <button
              onClick={() => setPreviewFile(selectedFile)}
              className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5"
              style={{
                backgroundColor: theme.BLUE,
                color: "#FFFFFF",
              }}
            >
              <Eye size={13} /> Open
            </button>
          )}
        </div>
      </div>

      {/* Files List View */}
      <div
        className="rounded-2xl border p-2 min-h-[380px] max-h-[500px] overflow-y-auto space-y-1.5"
        style={{
          backgroundColor: theme.CARD,
          borderColor: theme.BORDER,
        }}
      >
        {displayItems.length === 0 ? (
          <div
            className="text-center py-20 text-xs"
            style={{ color: theme.MUTED }}
          >
            Nothing to show in this folder.
          </div>
        ) : (
          displayItems.map((item) => {
            const isSelected = selectedFile?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.isDir) {
                    handleFolderClick(item.path);
                  } else {
                    setSelectedFile(item);
                  }
                }}
                onDoubleClick={() => {
                  if (item.isDir) {
                    handleFolderClick(item.path);
                  } else {
                    setPreviewFile(item);
                  }
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-all border"
                style={{
                  backgroundColor: isSelected ? theme.BLUE : "transparent",
                  borderColor: isSelected ? theme.ACCENT : "transparent",
                  color: isSelected ? "#FFFFFF" : theme.PALE,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = theme.CARD_HOVER;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <div className="flex items-center gap-3 truncate">
                  {item.isDir ? (
                    <Folder size={18} className="text-amber-400 shrink-0" />
                  ) : (
                    <FileText size={18} className="text-sky-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <div className="font-bold truncate">{item.name}</div>
                    <div className="text-[10px] opacity-75 truncate">{item.path}</div>
                  </div>
                </div>

                <div className="text-[11px] font-mono shrink-0" style={{ color: theme.MUTED }}>
                  {item.isDir ? "Folder" : `${item.size ? Math.round(item.size / 1024) : 1} KB`}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl rounded-2xl border flex flex-col max-h-[85vh] overflow-hidden shadow-2xl"
            style={{
              backgroundColor: theme.NAVY,
              borderColor: theme.BORDER,
            }}
          >
            {/* Modal Header */}
            <div
              className="px-5 py-3.5 border-b flex items-center justify-between"
              style={{ borderColor: theme.BORDER }}
            >
              <div className="flex items-center gap-2">
                <FileText size={18} style={{ color: theme.ACCENT }} />
                <span className="font-bold text-sm text-white">{previewFile.name}</span>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-white/70 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 flex-1 overflow-y-auto">
              <pre
                className="font-mono text-xs p-3.5 rounded-xl border whitespace-pre-wrap leading-relaxed select-text"
                style={{
                  backgroundColor: theme.CARD,
                  borderColor: theme.BORDER,
                  color: theme.PALE,
                }}
              >
                {previewFile.content || "No text content available for this file."}
              </pre>
            </div>

            {/* Modal Footer */}
            <div
              className="p-3.5 border-t flex justify-end gap-2"
              style={{ borderColor: theme.BORDER }}
            >
              <button
                onClick={() => {
                  const blob = new Blob([previewFile.content || ""], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = previewFile.name;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 text-white"
                style={{
                  borderColor: theme.BORDER,
                  backgroundColor: theme.BLUE,
                }}
              >
                <Download size={14} /> Download
              </button>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold border text-white/80"
                style={{ borderColor: theme.BORDER }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
