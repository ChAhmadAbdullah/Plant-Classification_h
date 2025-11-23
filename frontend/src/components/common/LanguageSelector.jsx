import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { LANGUAGES, LANGUAGE_NAMES } from "../../utils/constants";

const LanguageSelector = () => {
  const { language, setLanguage, isLoading } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    {
      code: LANGUAGES.URDU,
      name: LANGUAGE_NAMES[LANGUAGES.URDU],
      flag: "🇵🇰",
      direction: "rtl",
    },
    {
      code: LANGUAGES.ENGLISH,
      name: LANGUAGE_NAMES[LANGUAGES.ENGLISH],
      flag: "🇺🇸",
      direction: "ltr",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (newLanguage) => {
    if (newLanguage !== language && !isLoading) {
      setLanguage(newLanguage);
      setDropdownOpen(false);
    }
  };

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
        aria-label="Select language"
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span>{currentLanguage?.name}</span>
        <i className={`bi bi-chevron-down transition-transform ${dropdownOpen ? "rotate-180" : ""} ${isLoading ? "animate-spin" : ""}`}></i>
      </button>

      {dropdownOpen && (
        <div className="absolute top-full mt-2 right-0 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isLoading}
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                language === lang.code
                  ? "bg-primary-50 text-primary-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {language === lang.code && (
                <i className="bi bi-check2 text-primary-600"></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
