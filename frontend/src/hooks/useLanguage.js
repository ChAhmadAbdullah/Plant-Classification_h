import { useLanguageContext } from '../contexts/LanguageContext';

export const useLanguage = () => {
  const { language, setLanguage, t, isRTL } = useLanguageContext();
  return { language, setLanguage, t, isRTL };
};

