import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Translation Service with React Context
 * Provides live translation functionality across the application
 */

// Language codes mapping
export const LANGUAGE_CODES = {
  ENGLISH: 'en',
  HINDI: 'hi',
  // Add more languages as needed
};

// Translation dictionary - English to Hindi mappings
const TRANSLATIONS = {
  // Navigation & Common
  'Dashboard': 'डैशबोर्ड',
  'Leads': 'लीड्स',
  'Clients Management': 'क्लाइंट प्रबंधन',
  'Projects Management': 'प्रोजेक्ट प्रबंधन',
  'Employee Management': 'कर्मचारी प्रबंधन',
  'Site Expenses': 'साइट खर्च',
  'Site Received': 'साइट प्राप्त',
  'Reports': 'रिपोर्ट',
  'Settings': 'सेटिंग्स',
  'Help & Support': 'सहायता और समर्थन',
  'Manage Everything from a single place': 'एक ही स्थान से सब कुछ प्रबंधित करें',
  'Track and manage your potential clients': 'अपने संभावित ग्राहकों को ट्रैक और प्रबंधित करें',
  'Manage your client relationships': 'अपने ग्राहक संबंधों का प्रबंधन करें',
  'Oversee all your projects': 'अपने सभी प्रोजेक्टों का निरीक्षण करें',
  'Manage your team effectively': 'अपनी टीम को प्रभावी ढंग से प्रबंधित करें',
  'Track construction expenses': 'निर्माण खर्च ट्रैक करें',
  'Monitor received payments': 'प्राप्त भुगतान की निगरानी करें',
  'View detailed analytics and reports': 'विस्तृत विश्लेषण और रिपोर्ट देखें',
  'Configure your preferences': 'अपनी प्राथमिकताएं कॉन्फ़िगर करें',
  'Get assistance and support': 'सहायता और समर्थन प्राप्त करें',

  // Dashboard elements
  'Total Projects': 'कुल प्रोजेक्ट',
  'Total Clients': 'कुल ग्राहक',
  'Total Employees': 'कुल कर्मचारी',
  'Pending Task': 'लंबित कार्य',
  'Project Summary': 'प्रोजेक्ट सारांश',
  'Material Request': 'सामग्री अनुरोध',
  'Recent Transaction': 'हालिया लेनदेन',
  'Overall Progress': 'कुल प्रगति',
  'Performance Analytics': 'प्रदर्शन विश्लेषण',
  'Done': 'पूर्ण',
  'Delay': 'देरी',
  'Ongoing': 'चल रहा है',
  'Completed': 'पूर्ण',
  'Delayed': 'विलंबित',
  'At risk': 'जोखिम में',
  'On going': 'चल रहा है',
  'Project Name': 'प्रोजेक्ट नाम',
  'Task Name': 'कार्य नाम',
  'Due Date': 'नियत तारीख',
  'Status': 'स्थिति',
  'Name': 'नाम',
  'Progress': 'प्रगति',
  'Material': 'सामग्री',
  'Action': 'कार्रवाई',
  'Approve': 'अनुमोदित करें',
  'Reject': 'अस्वीकार करें',
  'Date': 'तारीख',
  'Transaction': 'लेनदेन',
  'Amount': 'राशि',
  'Invoice Paid': 'चालान भुगतान',
  'Advance Received': 'अग्रिम प्राप्त',
  'Contract Signed': 'अनुबंध हस्ताक्षरित',
  'Final Payment': 'अंतिम भुगतान',
  'Milestone Payment': 'माइलस्टोन भुगतान',

  // Sidebar sections
  'MANAGEMENT': 'प्रबंधन',
  'ACCOUNTING': 'लेखांकन',
  'BUSINESS REVIEW': 'व्यापार समीक्षा',
  'SETTINGS': 'सेटिंग्स',
  'LOG OUT': 'लॉग आउट',

  // Search and other
  'Search': 'खोजें',

  // Status badges
  'New': 'नया',
  'Contacted': 'संपर्क किया गया',
  'Qualified': 'योग्य',
  'Proposal': 'प्रस्ताव',
  'Negotiation': 'संपादन',

  // Table headers
  'Lead': 'लीड',
  'Contact': 'संपर्क',
  'Value': 'मूल्य',
  'Actions': 'क्रियाएँ',
  'Recent Leads': 'हालिया लीड',

  // Stats
  'This Month': 'इस महीने',
  'Conversion Rate': 'रूपांतरण दर',
};

// Get language name from code
export const getLanguageName = (code) => {
  switch (code) {
    case LANGUAGE_CODES.ENGLISH:
      return 'English';
    case LANGUAGE_CODES.HINDI:
      return 'हिंदी';
    default:
      return code;
  }
};

// Translation Context
const TranslationContext = createContext();

// Translation Provider Component
export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGE_CODES.ENGLISH);
  const [isTranslating, setIsTranslating] = useState(false);

  // Function to get translated text
  const t = (key) => {
    if (currentLanguage === LANGUAGE_CODES.ENGLISH) {
      return key; // Return original text for English
    }

    // Return translated text if available, otherwise fallback to original
    return TRANSLATIONS[key] || key;
  };

  // Change language function
  const changeLanguage = async (newLanguage) => {
    if (newLanguage === currentLanguage) return;

    setIsTranslating(true);

    try {
      // If switching to Hindi, we could optionally pre-load translations
      // For now, we'll just switch the language immediately
      setCurrentLanguage(newLanguage);
    } catch (error) {
      console.error('Language change error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Context value
  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isTranslating,
    languages: LANGUAGE_CODES,
    getLanguageName,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use translation
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

/**
 * Translate text using Google Translate API (for dynamic content)
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code (e.g., 'en')
 * @param {string} targetLang - Target language code (e.g., 'hi')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, sourceLang = 'en', targetLang = 'hi') => {
  if (!text || text.trim() === '') {
    return text;
  }

  if (sourceLang === targetLang) {
    return text; // No translation needed
  }

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );

    const data = await response.json();

    // Extract translated text from Google's response format
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }

    // Fallback: return original text if translation fails
    return text;
  } catch (error) {
    console.error(`Translation error (${sourceLang} -> ${targetLang}):`, error);
    return text; // Return original text on error
  }
};
