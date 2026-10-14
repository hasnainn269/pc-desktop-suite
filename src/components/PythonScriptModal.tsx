import React, { useState } from "react";
import { ThemeColors } from "../types/theme";
import { COMPLETED_PYTHON_SCRIPT } from "../utils/pythonScript";
import { Copy, Check, Download, X, Terminal, CheckCircle2 } from "lucide-react";

interface PythonScriptModalProps {
  theme: ThemeColors;
  onClose: () => void;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({
  theme,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(COMPLETED_PYTHON_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([COMPLETED_PYTHON_SCRIPT], {
      type: "text/x-python;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "personal_assistant.py";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-4xl rounded-2xl border flex flex-col max-h-[90vh] overflow-hidden shadow-2xl"
        style={{
          backgroundColor: theme.NAVY,
          borderColor: theme.BORDER,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: theme.BORDER }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🐍</span>
            <div>
              <h2 className="font-bold text-base text-white">
                Completed Python Desktop Script
              </h2>
              <p className="text-xs" style={{ color: theme.PALE }}>
                CustomTkinter · Smooth Themes Edition · personal_assistant.py
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all text-white"
              style={{
                borderColor: theme.BORDER,
                backgroundColor: theme.CARD,
              }}
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              style={{
                backgroundColor: theme.ACCENT,
                color: theme.NAVY,
              }}
            >
              <Download size={14} />
              <span>Download .py</span>
            </button>

            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div
          className="px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{
            backgroundColor: theme.SIDEBAR,
            borderColor: theme.BORDER,
          }}
        >
          <div className="flex items-center gap-2">
            <Terminal size={14} style={{ color: theme.ACCENT }} />
            <span className="font-mono text-white/90">
              pip install customtkinter pymupdf psutil requests pillow
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <CheckCircle2 size={13} />
            <span>Bug-fixed, safe calculator & complete offline suite</span>
          </div>
        </div>

        {/* Code display */}
        <div className="flex-1 overflow-y-auto p-4 select-text">
          <pre
            className="font-mono text-xs p-4 rounded-xl border leading-relaxed overflow-x-auto whitespace-pre"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
              color: theme.PALE,
            }}
          >
            {COMPLETED_PYTHON_SCRIPT}
          </pre>
        </div>

        {/* Footer */}
        <div
          className="p-3.5 border-t flex items-center justify-between text-xs"
          style={{ borderColor: theme.BORDER, color: theme.MUTED }}
        >
          <span>Run locally with: python personal_assistant.py</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold border text-white/80"
            style={{ borderColor: theme.BORDER }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
