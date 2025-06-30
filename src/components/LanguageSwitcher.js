import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ className = '' }) => {
  const { currentLanguage, toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleLanguage}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        currentLanguage === 'ar'
          ? 'bg-blue-600  hover:bg-blue-700'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${className}`}
      style={{ direction: 'ltr' }} // Keep button direction LTR
    >
      {currentLanguage === 'en' ? 'العربية' : 'English'}
    </button>
  );
};

export default LanguageSwitcher; 