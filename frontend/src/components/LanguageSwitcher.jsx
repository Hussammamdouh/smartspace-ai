import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { colors } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
      style={{
        backgroundColor: colors.surface,
        color: colors.text,
      }}
    >
      <FaGlobe />
      <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
};

export default LanguageSwitcher; 