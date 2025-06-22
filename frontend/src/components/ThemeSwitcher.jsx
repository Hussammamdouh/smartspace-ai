import { useTranslation } from 'react-i18next';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
      style={{
        backgroundColor: colors.surface,
        color: colors.text,
      }}
      aria-label={isDarkMode ? t('lightMode') : t('darkMode')}
    >
      {isDarkMode ? <FaSun /> : <FaMoon />}
      <span>{isDarkMode ? t('lightMode') : t('darkMode')}</span>
    </button>
  );
};

export default ThemeSwitcher; 