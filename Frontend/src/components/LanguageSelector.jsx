import React, { useState, useRef, useEffect } from "react";
import { FiGlobe, FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../services/translationService.jsx";

const LanguageSelector = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentLanguage, changeLanguage, getLanguageName, languages } = useTranslation();
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const selectLanguage = async (lang) => {
    await changeLanguage(lang);
    setShowDropdown(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="top-navbar-translator"
        onClick={toggleDropdown}
      >
        <div className="flex items-center gap-1">
          <FiGlobe size={16} className="text-blue-600" />
          <span className="text-[10px] font-medium text-gray-700">
            {getLanguageName(currentLanguage)}
          </span>
          <FiChevronDown size={10} className="text-gray-500" />
        </div>
      </button>

      {/* DROPDOWN MENU */}
      {showDropdown && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-[90px] bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <button
            onClick={() => selectLanguage(languages.ENGLISH)}
            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center justify-between ${currentLanguage === languages.ENGLISH ? 'bg-blue-100' : ''}`}
          >
            <span>English</span>
            {currentLanguage === languages.ENGLISH && <span className="text-blue-600">✓</span>}
          </button>
          <button
            onClick={() => selectLanguage(languages.HINDI)}
            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center justify-between ${currentLanguage === languages.HINDI ? 'bg-blue-100' : ''}`}
          >
            <span>हिंदी</span>
            {currentLanguage === languages.HINDI && <span className="text-blue-600">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
