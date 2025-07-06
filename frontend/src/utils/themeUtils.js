// Theme utility functions for consistent styling across components

export const getThemeClasses = (isDarkMode) => {
  return {
    // Background colors
    bgPrimary: isDarkMode ? 'bg-[#A58077]' : 'bg-[#8B6B61]',
    bgSecondary: isDarkMode ? 'bg-[#E5CBBE]' : 'bg-[#D4B5A0]',
    bgBackground: isDarkMode ? 'bg-[#181818]' : 'bg-[#F5F1ED]',
    bgSurface: isDarkMode ? 'bg-[#2C2C2C]' : 'bg-[#FFFFFF]',
    bgSurfaceLight: isDarkMode ? 'bg-[#3C3C3C]' : 'bg-[#FAF7F3]',
    bgSurfaceDark: isDarkMode ? 'bg-[#1e1e1e]' : 'bg-[#F0EDE9]',
    
    // Text colors
    textPrimary: isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]',
    textSecondary: isDarkMode ? 'text-[#E5CBBE]' : 'text-[#D4B5A0]',
    textText: isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]',
    textTextSecondary: isDarkMode ? 'text-[#A58077]' : 'text-[#666666]',
    textWhite: 'text-white',
    
    // Border colors
    borderPrimary: isDarkMode ? 'border-[#A58077]' : 'border-[#8B6B61]',
    borderSecondary: isDarkMode ? 'border-[#E5CBBE]' : 'border-[#D4B5A0]',
    borderSurface: isDarkMode ? 'border-[#3C3C3C]' : 'border-[#E5D3C7]',
    borderDark: isDarkMode ? 'border-[#2a2a2a]' : 'border-[#D4B5A0]',
    
    // Focus ring colors
    focusRing: isDarkMode ? 'focus:ring-[#A58077]' : 'focus:ring-[#8B6B61]',
    
    // Hover states
    hoverBgPrimary: isDarkMode ? 'hover:bg-[#8B6B63]' : 'hover:bg-[#7A5A52]',
    hoverBgSecondary: isDarkMode ? 'hover:bg-[#D4B5A0]' : 'hover:bg-[#C4A590]',
    hoverBgSurface: isDarkMode ? 'hover:bg-[#3a3a3a]' : 'hover:bg-[#F0EDE9]',
    hoverTextPrimary: isDarkMode ? 'hover:text-[#A58077]' : 'hover:text-[#8B6B61]',
    
    // Disabled states
    disabled: 'bg-[#A09C9C] cursor-not-allowed',
    
    // Shadow
    shadow: isDarkMode ? 'shadow-lg' : 'shadow-md',
  };
};

export const getThemeStyles = (isDarkMode) => {
  return {
    // Background colors
    background: isDarkMode ? '#181818' : '#F5F1ED',
    surface: isDarkMode ? '#2C2C2C' : '#FFFFFF',
    surfaceLight: isDarkMode ? '#3C3C3C' : '#FAF7F3',
    surfaceDark: isDarkMode ? '#1e1e1e' : '#F0EDE9',
    
    // Text colors
    text: isDarkMode ? '#E5CBBE' : '#2C2C2C',
    textSecondary: isDarkMode ? '#A58077' : '#666666',
    primary: isDarkMode ? '#A58077' : '#8B6B61',
    secondary: isDarkMode ? '#E5CBBE' : '#D4B5A0',
    
    // Border colors
    border: isDarkMode ? '#3C3C3C' : '#E5D3C7',
    borderDark: isDarkMode ? '#2a2a2a' : '#D4B5A0',
    
    // Shadow
    shadow: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(139, 107, 97, 0.1)',
  };
};

// Common component styles
export const getComponentStyles = (isDarkMode) => {
  const styles = getThemeStyles(isDarkMode);
  
  return {
    // Card styles
    card: {
      backgroundColor: styles.surface,
      color: styles.text,
      border: `1px solid ${styles.border}`,
      borderRadius: '0.5rem',
      padding: '1.5rem',
      boxShadow: `0 4px 6px -1px ${styles.shadow}`,
    },
    
    // Input styles
    input: {
      backgroundColor: styles.surface,
      color: styles.text,
      border: `1px solid ${styles.border}`,
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    
    // Button styles
    button: {
      primary: {
        backgroundColor: styles.primary,
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          backgroundColor: isDarkMode ? '#8B6B63' : '#7A5A52',
        },
      },
      secondary: {
        backgroundColor: 'transparent',
        color: styles.primary,
        border: `1px solid ${styles.primary}`,
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          backgroundColor: styles.primary,
          color: 'white',
        },
      },
    },
    
    // Page container
    pageContainer: {
      backgroundColor: styles.background,
      color: styles.text,
      minHeight: '100vh',
      padding: '1rem',
    },
  };
};

// CSS Variables for use in CSS files
export const getCSSVariables = (isDarkMode) => {
  return {
    '--primary': isDarkMode ? '#A58077' : '#8B6B61',
    '--secondary': isDarkMode ? '#E5CBBE' : '#D4B5A0',
    '--background': isDarkMode ? '#181818' : '#F5F1ED',
    '--surface': isDarkMode ? '#2C2C2C' : '#FFFFFF',
    '--surface-light': isDarkMode ? '#3C3C3C' : '#FAF7F3',
    '--surface-dark': isDarkMode ? '#1e1e1e' : '#F0EDE9',
    '--text': isDarkMode ? '#E5CBBE' : '#2C2C2C',
    '--text-secondary': isDarkMode ? '#A58077' : '#666666',
    '--border': isDarkMode ? '#3C3C3C' : '#E5D3C7',
    '--border-dark': isDarkMode ? '#2a2a2a' : '#D4B5A0',
    '--shadow': isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(139, 107, 97, 0.1)',
  };
}; 