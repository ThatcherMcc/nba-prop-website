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
  | "classic"
  | "press-box"
  | "hardwood";

type ThemeLayoutContextType = {
  colorTheme: ColorTheme;
  setColorTheme: (t: ColorTheme) => void;
};

const ThemeLayoutContext = createContext<ThemeLayoutContextType>({
  colorTheme: "default",
  setColorTheme: () => {},
});

export function useThemeLayout() {
  return useContext(ThemeLayoutContext);
}

const THEME_KEY = "pe-color-theme";

export default function ThemeLayoutProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("default");

  useEffect(() => {
    const VALID_THEMES: ColorTheme[] = ["default", "classic", "press-box", "hardwood"];
    try {
      const stored = localStorage.getItem(THEME_KEY);
      const theme = VALID_THEMES.includes(stored as ColorTheme) ? (stored as ColorTheme) : "default";
      setColorThemeState(theme);
      applyThemeAttribute(theme);
      if (stored !== theme) {
        localStorage.setItem(THEME_KEY, theme);
      }
    } catch {
      // Ignore localStorage failures.
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

  return (
    <ThemeLayoutContext.Provider
      value={{ colorTheme, setColorTheme }}
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
