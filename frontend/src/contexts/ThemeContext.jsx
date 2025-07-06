import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Set CSS variables for theme colors
    const root = document.documentElement;
    if (isDarkMode) {
      // Dark mode colors
      root.style.setProperty('--primary', '#A58077');
      root.style.setProperty('--secondary', '#E5CBBE');
      root.style.setProperty('--background', '#181818');
      root.style.setProperty('--surface', '#2C2C2C');
      root.style.setProperty('--surface-light', '#3C3C3C');
      root.style.setProperty('--text', '#E5CBBE');
      root.style.setProperty('--text-secondary', '#A58077');
      root.style.setProperty('--border', '#3C3C3C');
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.3)');
    } else {
      // Light mode colors with light beige background
      root.style.setProperty('--primary', '#8B6B61');
      root.style.setProperty('--secondary', '#D4B5A0');
      root.style.setProperty('--background', '#F5F1ED'); // Light beige background
      root.style.setProperty('--surface', '#FAF7F3'); // Lighter beige for cards
      root.style.setProperty('--surface-light', '#F0EBE6'); // Even lighter beige for secondary surfaces
      root.style.setProperty('--text', '#2C2C2C');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--border', '#E5D3C7'); // Light beige border
      root.style.setProperty('--shadow', 'rgba(139, 107, 97, 0.1)');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      primary: isDarkMode ? '#A58077' : '#8B6B61',
      secondary: isDarkMode ? '#E5CBBE' : '#D4B5A0',
      background: isDarkMode ? '#181818' : '#F5F1ED', // Light beige for light mode
      surface: isDarkMode ? '#2C2C2C' : '#FAF7F3',
      surfaceLight: isDarkMode ? '#3C3C3C' : '#F0EBE6',
      text: isDarkMode ? '#E5CBBE' : '#2C2C2C',
      textSecondary: isDarkMode ? '#A58077' : '#666666',
      border: isDarkMode ? '#3C3C3C' : '#E5D3C7',
      shadow: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(139, 107, 97, 0.1)',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 