"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import CommandPalette from "./CommandPalette";

type CommandPaletteContextType = {
  openPalette: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextType>({
  openPalette: () => {},
});

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

export default function CommandPaletteProvider({
  playerNames,
  children,
}: {
  playerNames: string[];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openPalette = useCallback(() => setIsOpen(true), []);
  const closePalette = useCallback(() => setIsOpen(false), []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ openPalette }}>
      {children}
      <CommandPalette
        playerNames={playerNames}
        isOpen={isOpen}
        onClose={closePalette}
      />
    </CommandPaletteContext.Provider>
  );
}
