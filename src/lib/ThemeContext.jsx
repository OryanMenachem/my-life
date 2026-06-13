import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Theme definitions: background / accent / deepAccent
// card, foreground, mutedFg, border are derived per theme
export const THEMES = {
  cream:    { bg: "#F1EFEB", card: "#FFFFFF", fg: "#1C1A17", mutedFg: "#7A7570", border: "#E2DED8", accent: "#C08743", deepAccent: "#946A2B" },
  sky:      { bg: "#EEF2F6", card: "#FFFFFF", fg: "#182430", mutedFg: "#6A7D8E", border: "#D8E3ED", accent: "#4F86B8", deepAccent: "#377A74" },
  sage:     { bg: "#EEF1EA", card: "#FFFFFF", fg: "#1A2218", mutedFg: "#5E7258", border: "#D8DFD2", accent: "#6F9460", deepAccent: "#42775C" },
  blossom:  { bg: "#F6EEF0", card: "#FFFFFF", fg: "#28141C", mutedFg: "#8B6070", border: "#EBDAE0", accent: "#C56F8A", deepAccent: "#714E8A" },
  lavender: { bg: "#F0EEF6", card: "#FFFFFF", fg: "#1C1928", mutedFg: "#6E698A", border: "#DCD9ED", accent: "#7E6DB8", deepAccent: "#4D5A9C" },
  mint:     { bg: "#E9F3EF", card: "#FFFFFF", fg: "#0E2820", mutedFg: "#547567", border: "#D0E7DD", accent: "#3F9C79", deepAccent: "#2B7A7A" },
  sand:     { bg: "#F3EFE7", card: "#FFFFFF", fg: "#241C10", mutedFg: "#806A50", border: "#E3DDD1", accent: "#B8924F", deepAccent: "#86663D" },
  charcoal: { bg: "#1A1A1E", card: "#242429", fg: "#ECECEF", mutedFg: "#8E8E98", border: "#2E2E34", accent: "#E0A766", deepAccent: "#BCC594" },
};

const THEME_KEY = "mylife_theme";

function applyTheme(name) {
  const t = THEMES[name] || THEMES.cream;
  const root = document.documentElement;

  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }

  root.style.setProperty("--background",          hexToHsl(t.bg));
  root.style.setProperty("--foreground",           hexToHsl(t.fg));
  root.style.setProperty("--card",                 hexToHsl(t.card));
  root.style.setProperty("--card-foreground",      hexToHsl(t.fg));
  root.style.setProperty("--popover",              hexToHsl(t.card));
  root.style.setProperty("--popover-foreground",   hexToHsl(t.fg));
  root.style.setProperty("--muted",                hexToHsl(t.bg));
  root.style.setProperty("--muted-foreground",     hexToHsl(t.mutedFg));
  root.style.setProperty("--border",               hexToHsl(t.border));
  root.style.setProperty("--input",                hexToHsl(t.border));
  root.style.setProperty("--primary",              hexToHsl(t.accent));
  root.style.setProperty("--primary-foreground",   name === "charcoal" ? "0 0% 10%" : "0 0% 100%");
  root.style.setProperty("--secondary",            hexToHsl(t.bg));
  root.style.setProperty("--secondary-foreground", hexToHsl(t.fg));
  root.style.setProperty("--accent",               hexToHsl(t.bg));
  root.style.setProperty("--accent-foreground",    hexToHsl(t.accent));
  root.style.setProperty("--ring",                 hexToHsl(t.accent));
  root.style.setProperty("--theme-accent",         t.accent);
  root.style.setProperty("--theme-deep-accent",    t.deepAccent);
  root.style.setProperty("--theme-card",           t.card);
  root.style.setProperty("--theme-bg",             t.bg);
}

const ThemeContext = createContext({
  theme: "cream",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_KEY) || "cream";
  });

  // Apply on mount immediately
  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Load saved theme from user record
  useEffect(() => {
    base44.auth.me().then((me) => {
      if (me?.theme && me.theme !== theme) {
        setThemeState(me.theme);
        localStorage.setItem(THEME_KEY, me.theme);
        applyTheme(me.theme);
      }
    }).catch(() => {});
  }, []);

  const setTheme = useCallback(async (name) => {
    setThemeState(name);
    localStorage.setItem(THEME_KEY, name);
    applyTheme(name);
    try {
      await base44.auth.updateMe({ theme: name });
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}