import React from "react";
import { ThemeColors } from "../types/theme";

interface GradientBannerProps {
  title: string;
  subtitle?: string;
  theme: ThemeColors;
  height?: number;
  titleSize?: string;
  subtitleSize?: string;
}

export const GradientBanner: React.FC<GradientBannerProps> = ({
  title,
  subtitle,
  theme,
  height = 96,
  titleSize = "text-2xl",
  subtitleSize = "text-xs",
}) => {
  return (
    <div
      className="relative w-full rounded-xl overflow-hidden flex flex-col justify-center px-6 shadow-md transition-all duration-300"
      style={{
        height: `${height}px`,
        background: `linear-gradient(90deg, ${theme.NAVY} 0%, ${theme.BLUE} 50%, ${theme.MID} 100%)`,
      }}
    >
      {/* Subtle overlay shimmer */}
      <div className="absolute inset-0 bg-white/5 pointer-events-none" />

      <h1 className={`relative font-bold text-white tracking-tight ${titleSize} drop-shadow-sm`}>
        {title}
      </h1>
      {subtitle && (
        <p
          className={`relative font-medium mt-1 transition-opacity ${subtitleSize}`}
          style={{ color: theme.PALE }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
