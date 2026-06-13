import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const LANG_KEY = "mylife_language";

const LanguageContext = createContext({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem(LANG_KEY) || "en");

  // Apply dir to <html>
  useEffect(() => {
    document.documentElement.setAttribute("dir", lang === "he" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  // Load from user record once on mount
  useEffect(() => {
    base44.auth.me().then((me) => {
      if (me?.language && me.language !== lang) {
        setLangState(me.language);
        localStorage.setItem(LANG_KEY, me.language);
      }
    }).catch(() => {});
  }, []);

  const setLang = useCallback(async (l) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
    try { await base44.auth.updateMe({ language: l }); } catch {}
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}