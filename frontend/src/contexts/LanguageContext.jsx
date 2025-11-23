import React, { createContext, useContext, useState, useEffect } from "react";
import { LANGUAGES, UI_TEXT } from "../utils/constants";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("preferredLanguage") || LANGUAGES.URDU;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem("preferredLanguage", language);

    // Update document attributes for RTL/LTR
    document.documentElement.dir = language === LANGUAGES.URDU ? "rtl" : "ltr";
    document.documentElement.lang = language === LANGUAGES.URDU ? "ur" : "en";

    // Update body class for CSS styling
    document.body.classList.remove("urdu-layout", "english-layout");
    document.body.classList.add(
      language === LANGUAGES.URDU ? "urdu-layout" : "english-layout"
    );

    // Emit language change event
    window.dispatchEvent(
      new CustomEvent("languageChanged", { detail: language })
    );
  }, [language]);

  const t = (key) => {
    return UI_TEXT[language]?.[key] || key;
  };

  const switchLanguage = (newLanguage) => {
    if (Object.values(LANGUAGES).includes(newLanguage)) {
      setIsLoading(true);

      // Simulate loading for smooth transition
      setTimeout(() => {
        setLanguage(newLanguage);
        setIsLoading(false);
      }, 300);
    }
  };

  const value = {
    language,
    setLanguage: switchLanguage,
    t,
    isLoading,
    isUrdu: language === LANGUAGES.URDU,
    isEnglish: language === LANGUAGES.ENGLISH,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
