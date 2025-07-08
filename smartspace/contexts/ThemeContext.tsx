import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import { Colors } from '../constants/Colors';

export type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  colors: typeof Colors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState<ThemeType>(colorScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => listener.remove();
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const themedColors = {
    ...Colors,
    background: theme === 'dark' ? Colors.backgroundDark : Colors.background,
    surface: theme === 'dark' ? Colors.surfaceDark : Colors.surface,
    text: theme === 'dark' ? Colors.textDark : Colors.text,
    textSecondary: theme === 'dark' ? Colors.textSecondaryDark : Colors.textSecondary,
    border: theme === 'dark' ? Colors.borderDark : Colors.border,
    shadow: theme === 'dark' ? Colors.shadowDark : Colors.shadow,
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: themedColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}; 