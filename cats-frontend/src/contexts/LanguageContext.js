"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Simple translation dictionary for 3 languages - perfect for Indian government sites!
const translations = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_dashboard: "Dashboard",
    nav_login: "Login",
    nav_logout: "Logout",
    nav_file_complaint: "File Complaint",

    // Home page
    home_welcome: "Welcome to CATS",
    home_subtitle: "Citizen Assistance and Tracking System",
    home_description:
      "A comprehensive platform for senior citizens to file complaints and track their resolution status easily.",
    get_started: "Get Started",
    learn_more: "Learn More",

    // Dashboard
    dashboard_welcome: "Welcome Back",
    my_complaints: "My Complaints",
    file_new_complaint: "File New Complaint",
    recent_activity: "Recent Activity",

    // Common
    loading: "Loading...",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
  },
  hi: {
    // Navigation
    nav_home: "होम",
    nav_dashboard: "डैशबोर्ड",
    nav_login: "लॉग इन करें",
    nav_logout: "लॉग आउट",
    nav_file_complaint: "शिकायत दर्ज करें",

    // Home page
    home_welcome: "CATS में आपका स्वागत है",
    home_subtitle: "नागरिक सहायता और ट्रैकिंग सिस्टम",
    home_description:
      "वरिष्ठ नागरिकों के लिए शिकायतें दर्ज करने और उनकी स्थिति को आसानी से ट्रैक करने के लिए एक व्यापक मंच।",
    get_started: "शुरू करें",
    learn_more: "और जानें",

    // Dashboard
    dashboard_welcome: "वापस स्वागत है",
    my_complaints: "मेरी शिकायतें",
    file_new_complaint: "नई शिकायत दर्ज करें",
    recent_activity: "हाल की गतिविधि",

    // Common
    loading: "लोड हो रहा है...",
    submit: "जमा करें",
    cancel: "रद्द करें",
    save: "सेव करें",
  },
  mr: {
    // Navigation - Marathi
    nav_home: "होम",
    nav_dashboard: "डॅशबोर्ड",
    nav_login: "लॉग इन करा",
    nav_logout: "लॉग आउट",
    nav_file_complaint: "तक्रार नोंदवा",

    // Home page
    home_welcome: "CATS मध्ये आपले स्वागत आहे",
    home_subtitle: "नागरिक सहाय्य आणि ट्रॅकिंग सिस्टम",
    home_description:
      "ज्येष्ठ नागरिकांसाठी तक्रारी नोंदवण्यासाठी आणि त्यांची स्थिती सहजपणे ट्रॅक करण्यासाठी एक व्यापक व्यासपीठ।",
    get_started: "सुरुवात करा",
    learn_more: "अधिक जाणून घ्या",

    // Dashboard
    dashboard_welcome: "परत स्वागत आहे",
    my_complaints: "माझ्या तक्रारी",
    file_new_complaint: "नवीन तक्रार नोंदवा",
    recent_activity: "अलीकडील क्रियाकलाप",

    // Common
    loading: "लोड होत आहे...",
    submit: "सबमिट करा",
    cancel: "रद्द करा",
    save: "सेव्ह करा",
  },
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  // Load saved language on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lang") || "en";
      setLanguage(saved);
    }
  }, []);

  // Save language when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", language);
    }
  }, [language]);

  // Cycle through all 3 languages: English → Hindi → Marathi → English
  const toggleLanguage = () => {
    setLanguage((prev) => {
      if (prev === "en") return "hi";
      if (prev === "hi") return "mr";
      return "en"; // mr → en
    });
  };

  // Get language display name for UI
  const getLanguageDisplay = () => {
    const displays = {
      en: "English",
      hi: "हिंदी",
      mr: "मराठी",
    };
    return displays[language] || "English";
  };

  // Semi-Automatic translation function - supports both pre-registered AND inline translations!
  const t = (key, en = "", hi = "", mr = "") => {
    // If it's a simple key (no inline translations provided), use pre-registered translations
    if (!en && !hi && !mr) {
      return translations[language][key] || translations["en"][key] || key;
    }

    // If inline translations are provided, use them based on current language
    if (language === "hi" && hi) return hi;
    if (language === "mr" && mr) return mr;
    if (language === "en" && en) return en;

    // Fallback: try pre-registered first, then English inline, then key
    return translations[language][key] || translations["en"][key] || en || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        getLanguageDisplay,
        t,
        isLoading: false, // No loading needed with inline translations
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
