'use client';

import { createContext, useContext, useState } from 'react';

interface ThemeCtxType {
  theme: string;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeCtxType>({ theme: 'a', toggle: () => {} });

export function ThemeProvider({ initial, children }: { initial: string; children: React.ReactNode }) {
  const [theme, setTheme] = useState(initial);
  return (
    <ThemeCtx.Provider value={{ theme, toggle: () => setTheme(t => (t === 'a' ? 'b' : 'a')) }}>
      <div data-theme={theme}>{children}</div>
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
