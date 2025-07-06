import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
      style={{
        backgroundColor: colors.surface,
        color: colors.text,
      }}
      aria-label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
    >
      {isDarkMode ? <FaSun /> : <FaMoon />}
      <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
};

export default ThemeSwitcher; 