import React, { useState } from "react";
import { ThemeColors } from "../types/theme";
import { VaultCredential } from "../types/assistant";
import { GradientBanner } from "./GradientBanner";
import {
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Search,
} from "lucide-react";

interface SecretVaultViewProps {
  theme: ThemeColors;
  credentials: VaultCredential[];
  onAddCredential: (item: Omit<VaultCredential, "id" | "updatedAt">) => void;
  onDeleteCredential: (id: string) => void;
}

export const SecretVaultView: React.FC<SecretVaultViewProps> = ({
  theme,
  credentials,
  onAddCredential,
  onDeleteCredential,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [masterPin, setMasterPin] = useState(() => {
    return localStorage.getItem("assistant_vault_pin") || "1234";
  });
  const [pinError, setPinError] = useState("");

  // Search & visibility
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New credential modal / drawer state
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newCategory, setNewCategory] = useState<VaultCredential["category"]>("Work");

  // Generator settings
  const [genLength, setGenLength] = useState(16);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === masterPin) {
      setIsUnlocked(true);
      setPinError("");
      setPinInput("");
    } else {
      setPinError("Incorrect PIN. Please try again (Default: 1234).");
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
    let generated = "";
    for (let i = 0; i < genLength; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
  };

  const handleSaveCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPassword.trim()) return;

    onAddCredential({
      title: newTitle.trim(),
      username: newUsername.trim(),
      password: newPassword.trim(),
      category: newCategory,
    });

    setNewTitle("");
    setNewUsername("");
    setNewPassword("");
    setIsAdding(false);
  };

  const filtered = credentials.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <GradientBanner
        title="Secret Password & Credentials Vault"
        subtitle="PIN-protected secure locker for passwords, API keys, and sensitive developer tokens."
        theme={theme}
      />

      {!isUnlocked ? (
        /* Locked PIN Screen */
        <div
          className="p-8 rounded-2xl border max-w-md mx-auto text-center space-y-6 shadow-xl my-8"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border"
            style={{
              backgroundColor: theme.NAVY,
              borderColor: theme.BORDER,
            }}
          >
            <Lock size={30} style={{ color: theme.ACCENT }} />
          </div>

          <div>
            <h3 className="font-bold text-lg text-white">Vault is Locked</h3>
            <p className="text-xs mt-1" style={{ color: theme.MUTED }}>
              Enter your 4-digit Master PIN to view your credentials.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              maxLength={8}
              autoFocus
              placeholder="••••"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError("");
              }}
              className="w-40 mx-auto text-center font-mono text-2xl tracking-widest py-2 rounded-xl outline-none border transition-all text-white"
              style={{
                backgroundColor: theme.NAVY,
                borderColor: pinError ? "#EF4444" : theme.BORDER,
              }}
            />

            {pinError && (
              <div className="text-xs text-red-400 font-semibold">{pinError}</div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md text-slate-900"
              style={{
                backgroundColor: theme.ACCENT,
              }}
            >
              <Unlock size={14} />
              <span>Unlock Secret Vault</span>
            </button>
          </form>

          <div
            className="p-3 rounded-xl border text-[11px] font-mono leading-relaxed"
            style={{
              backgroundColor: theme.NAVY,
              borderColor: theme.BORDER,
              color: theme.MUTED,
            }}
          >
            <span>💡 Default Vault PIN: </span>
            <strong className="text-white">1234</strong>
          </div>
        </div>
      ) : (
        /* Unlocked Vault Screen */
        <div className="space-y-3.5">
          {/* Header Controls */}
          <div
            className="p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                <Unlock size={14} />
                <span>Vault Unlocked ({credentials.length} stored)</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-2.5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search accounts…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl text-xs outline-none border transition-all text-white font-mono"
                  style={{
                    backgroundColor: theme.NAVY,
                    borderColor: theme.BORDER,
                  }}
                />
              </div>

              <button
                onClick={() => setIsAdding(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all text-slate-900"
                style={{
                  backgroundColor: theme.ACCENT,
                }}
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>

              <button
                onClick={() => setIsUnlocked(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all text-white"
                style={{
                  backgroundColor: theme.NAVY,
                  borderColor: theme.BORDER,
                }}
              >
                <Lock size={13} />
                <span>Lock Vault</span>
              </button>
            </div>
          </div>

          {/* Add Credential Modal */}
          {isAdding && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div
                className="w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl"
                style={{
                  backgroundColor: theme.NAVY,
                  borderColor: theme.BORDER,
                }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.BORDER }}>
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <KeyRound size={16} style={{ color: theme.ACCENT }} />
                    <span>Store New Password / Key</span>
                  </div>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveCredential} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-white/80 block mb-1">
                      Account / Service Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GitHub, Google, Wi-Fi Key, Server Root"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl text-xs outline-none border text-white"
                      style={{ backgroundColor: theme.CARD, borderColor: theme.BORDER }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">
                        Username / Email
                      </label>
                      <input
                        type="text"
                        placeholder="john.doe@gmail.com"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs outline-none border text-white font-mono"
                        style={{ backgroundColor: theme.CARD, borderColor: theme.BORDER }}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">
                        Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl text-xs outline-none border text-white font-semibold cursor-pointer"
                        style={{ backgroundColor: theme.CARD, borderColor: theme.BORDER }}
                      >
                        <option value="Work">Work</option>
                        <option value="Social">Social</option>
                        <option value="Banking">Banking</option>
                        <option value="API Keys">API Keys</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-white/80">
                        Password or Secret
                      </label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <Sparkles size={11} /> Generate Strong (16 chars)
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl text-xs outline-none border text-white font-mono"
                      style={{ backgroundColor: theme.CARD, borderColor: theme.BORDER }}
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border text-white/70"
                      style={{ borderColor: theme.BORDER }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900"
                      style={{ backgroundColor: theme.ACCENT }}
                    >
                      Save to Vault
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.length === 0 ? (
              <div
                className="col-span-2 text-center py-24 text-xs"
                style={{ color: theme.MUTED }}
              >
                No credentials found. Click "Add Item" to store your first password!
              </div>
            ) : (
              filtered.map((c) => {
                const isPassVisible = Boolean(visiblePasswords[c.id]);
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border space-y-3 transition-all hover:bg-white/5"
                    style={{
                      backgroundColor: theme.CARD,
                      borderColor: theme.BORDER,
                    }}
                  >
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: theme.BORDER }}>
                      <div className="flex items-center gap-2">
                        <KeyRound size={16} style={{ color: theme.ACCENT }} />
                        <h4 className="font-bold text-sm text-white">{c.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {c.category}
                        </span>
                        <button
                          onClick={() => onDeleteCredential(c.id)}
                          className="text-white/40 hover:text-red-400 p-1"
                          title="Delete credential"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      {/* Username */}
                      <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: theme.NAVY }}>
                        <span className="truncate text-white/70 mr-2">{c.username || "No username"}</span>
                        <button
                          onClick={() => handleCopy(`user-${c.id}`, c.username)}
                          className="text-white/50 hover:text-white p-1"
                          title="Copy username"
                        >
                          {copiedId === `user-${c.id}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>

                      {/* Password */}
                      <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: theme.NAVY }}>
                        <span className="font-bold tracking-wider truncate text-white mr-2">
                          {isPassVisible ? c.password : "••••••••••••"}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => togglePasswordVisibility(c.id)}
                            className="text-white/50 hover:text-white p-1"
                            title={isPassVisible ? "Hide password" : "Show password"}
                          >
                            {isPassVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>

                          <button
                            onClick={() => handleCopy(`pass-${c.id}`, c.password)}
                            className="text-white/50 hover:text-white p-1"
                            title="Copy password"
                          >
                            {copiedId === `pass-${c.id}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
