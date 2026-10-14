export interface ThemeColors {
  NAVY: string;
  BLUE: string;
  MID: string;
  PALE: string;
  ACCENT: string;
  SIDEBAR: string;
  CARD: string;
  CARD_HOVER: string;
  BORDER: string;
  MUTED: string;
  GOOD: string;
  WARN: string;
  BAD: string;
}

export type ThemeName =
  | "Ocean Blue"
  | "Midnight Violet"
  | "Emerald Forest"
  | "Sunset Ember"
  | "Graphite Slate";

export const THEMES: Record<ThemeName, ThemeColors> = {
  "Ocean Blue": {
    NAVY: "#0D2137",
    BLUE: "#1557A8",
    MID: "#2575C4",
    PALE: "#E8F3FC",
    ACCENT: "#0EA5E9",
    SIDEBAR: "#081726",
    CARD: "#112D4A",
    CARD_HOVER: "#173B61",
    BORDER: "#1F4A75",
    MUTED: "#8FB3D9",
    GOOD: "#34D399",
    WARN: "#F59E0B",
    BAD: "#EF4444",
  },
  "Midnight Violet": {
    NAVY: "#1A1033",
    BLUE: "#6D28D9",
    MID: "#8B5CF6",
    PALE: "#F3EDFF",
    ACCENT: "#C084FC",
    SIDEBAR: "#120A26",
    CARD: "#25194A",
    CARD_HOVER: "#32225F",
    BORDER: "#4A3586",
    MUTED: "#B4A3DB",
    GOOD: "#34D399",
    WARN: "#F59E0B",
    BAD: "#EF4444",
  },
  "Emerald Forest": {
    NAVY: "#0B2420",
    BLUE: "#0F766E",
    MID: "#14B8A6",
    PALE: "#E6FFFA",
    ACCENT: "#34D399",
    SIDEBAR: "#071A17",
    CARD: "#0F3530",
    CARD_HOVER: "#14463F",
    BORDER: "#1E6258",
    MUTED: "#8ED1C3",
    GOOD: "#34D399",
    WARN: "#F59E0B",
    BAD: "#EF4444",
  },
  "Sunset Ember": {
    NAVY: "#2A1410",
    BLUE: "#C2410C",
    MID: "#EA580C",
    PALE: "#FFF1E6",
    ACCENT: "#FBBF24",
    SIDEBAR: "#1C0D0A",
    CARD: "#3B1E17",
    CARD_HOVER: "#4D2A20",
    BORDER: "#6B3A2B",
    MUTED: "#E0B49C",
    GOOD: "#34D399",
    WARN: "#F59E0B",
    BAD: "#EF4444",
  },
  "Graphite Slate": {
    NAVY: "#111827",
    BLUE: "#475569",
    MID: "#64748B",
    PALE: "#F1F5F9",
    ACCENT: "#38BDF8",
    SIDEBAR: "#0B1020",
    CARD: "#1B2433",
    CARD_HOVER: "#263247",
    BORDER: "#334155",
    MUTED: "#94A3B8",
    GOOD: "#34D399",
    WARN: "#F59E0B",
    BAD: "#EF4444",
  },
};
