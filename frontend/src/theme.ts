export interface Theme {
  bg: string;
  accent: string;
  soft: string;
}

export const THEMES: Theme[] = [
  { bg: "#FFEAD9", accent: "#F0611C", soft: "#FFD8BE" },
  { bg: "#ECE4FF", accent: "#7A4FF0", soft: "#DDCEFF" },
  { bg: "#D9F4E8", accent: "#0F9D6B", soft: "#BFEAD6" },
  { bg: "#DBEDFF", accent: "#1F7BE8", soft: "#C4E1FF" },
  { bg: "#FFE2EF", accent: "#E63F88", soft: "#FFCBE1" },
  { bg: "#FFF0C7", accent: "#CF8A00", soft: "#FFE69A" },
  { bg: "#D6F2F1", accent: "#0E9C9C", soft: "#BCE9E7" }
];

/** Map a theme to the CSS custom properties the UI reads. */
export function themeVars(theme: Theme): Record<string, string> {
  return {
    "--ww-bg": theme.bg,
    "--ww-accent": theme.accent,
    "--ww-soft": theme.soft
  };
}
