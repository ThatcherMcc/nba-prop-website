"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type ColorTheme =
  | "default"
  | "midnight"
  | "clean"
  | "press-box"
  | "hardwood"
  | "broadcast"
  | "monochrome";

export type LayoutVariant =
  | "current"
  | "spotlight"
  | "editorial"
  | "action-board"
  | "ticker-feed";

type ThemeLayoutContextType = {
  colorTheme: ColorTheme;
  layoutVariant: LayoutVariant;
  setColorTheme: (t: ColorTheme) => void;
  setLayoutVariant: (l: LayoutVariant) => void;
};

const ThemeLayoutContext = createContext<ThemeLayoutContextType>({
  colorTheme: "default",
  layoutVariant: "editorial",
  setColorTheme: () => {},
  setLayoutVariant: () => {},
});

export function useThemeLayout() {
  return useContext(ThemeLayoutContext);
}

const THEME_KEY = "pe-color-theme";
const LAYOUT_KEY = "pe-layout-variant";

export default function ThemeLayoutProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("default");
  const [layoutVariant, setLayoutVariantState] =
    useState<LayoutVariant>("editorial");

  // Restore from localStorage on mount (with migration guard for stale values)
  useEffect(() => {
    const VALID_THEMES: ColorTheme[] = ["default", "midnight", "clean", "press-box", "hardwood", "broadcast", "monochrome"];
    const VALID_LAYOUTS: LayoutVariant[] = ["current", "spotlight", "editorial", "action-board", "ticker-feed"];
    try {
      const stored = localStorage.getItem(THEME_KEY);
      const theme = VALID_THEMES.includes(stored as ColorTheme) ? (stored as ColorTheme) : "default";
      setColorThemeState(theme);
      applyThemeAttribute(theme);

      const storedLayout = localStorage.getItem(LAYOUT_KEY);
      const layout = VALID_LAYOUTS.includes(storedLayout as LayoutVariant) ? (storedLayout as LayoutVariant) : "editorial";
      setLayoutVariantState(layout);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const setColorTheme = useCallback((t: ColorTheme) => {
    setColorThemeState(t);
    applyThemeAttribute(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const setLayoutVariant = useCallback((l: LayoutVariant) => {
    setLayoutVariantState(l);
    try {
      localStorage.setItem(LAYOUT_KEY, l);
    } catch {
      // localStorage unavailable
    }
  }, []);

  return (
    <ThemeLayoutContext.Provider
      value={{ colorTheme, layoutVariant, setColorTheme, setLayoutVariant }}
    >
      {children}
    </ThemeLayoutContext.Provider>
  );
}

function applyThemeAttribute(theme: ColorTheme) {
  if (theme === "default") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}
