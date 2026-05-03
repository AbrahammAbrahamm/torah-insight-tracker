import { ReactNode, useEffect, useMemo, useState } from 'react';
import { I18nContext, Language, buildTranslator, buildNameTranslator } from '@/lib/i18n';

const STORAGE_KEY = 'torahTracker_language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'he' || stored === 'mixed') return stored;
    } catch {}
    return 'mixed';
  });

  const setLang = (l: Language) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  };

  const isRtl = lang === 'he';

  useEffect(() => {
    document.documentElement.lang = lang === 'he' ? 'he' : 'en';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [lang, isRtl]);

  const value = useMemo(() => ({
    lang,
    setLang,
    t: buildTranslator(lang),
    tn: buildNameTranslator(lang),
    isRtl,
  }), [lang, isRtl]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
