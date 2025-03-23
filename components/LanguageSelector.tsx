"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { languages } from "@/app/i18n/settings";

const languageNames: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  ta: "தமிழ்",
  te: "తెలుగు",
  bn: "বাংলা",
  // Add more languages as needed
};

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lng = pathname.split("/")[1];
    if (languages.includes(lng)) {
      setCurrentLang(lng);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (newLang: string) => {
    // Get the path without the language prefix
    const pathWithoutLang = pathname.split("/").slice(2).join("/");

    // Navigate to the same page with the new language
    router.push(`/${newLang}/${pathWithoutLang}`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="background-light800_dark300 text-dark400_light900 light-border body-medium rounded-lg px-4 py-2 flex items-center justify-between min-w-[140px] shadow-light100_dark100 transition-all hover:border-primary-500"
      >
        <span>{languageNames[currentLang] || currentLang}</span>
        <svg
          className={`h-4 w-4 text-dark400_light500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-full z-10 background-light900_dark200 rounded-lg shadow-light100_dark100 border light-border py-1 max-h-60 overflow-auto custom-scrollbar">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full text-left px-4 py-2 body-medium transition-colors hover:background-light800_dark300 ${
                lang === currentLang
                  ? "text-primary-500 background-light800_dark400"
                  : "text-dark300_light700"
              }`}
            >
              {languageNames[lang] || lang}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
