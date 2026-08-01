import { useState, useCallback } from 'react';

const translations: Record<string, Record<string, string>> = {
  en: {
    home: 'Home', sessions: 'Sessions', rooms: 'Rooms', people: 'Participants',
    services: 'Services', dash: 'Dashboard', admin: 'Admin', logout: 'Logout',
    events: 'Events', overview: 'Overview', schedule: 'Schedule',
  },
  ne: {
    home: 'गृह', sessions: 'सत्रहरू', rooms: 'कोठाहरू', people: 'सहभागीहरू',
    services: 'सेवाहरू', dash: 'ड्यासबोर्ड', admin: 'प्रशासक', logout: 'बाहिरिनुहोस्',
    events: 'कार्यक्रमहरू', overview: 'अवलोकन', schedule: 'तालिका',
  },
};

export function useI18n() {
  const [lang, setLang] = useState<'en'|'ne'>(() => (localStorage.getItem('lang') as 'en'|'ne') || 'en');
  const t = useCallback((key: string) => translations[lang][key] || translations.en[key] || key, [lang]);
  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'ne' : 'en';
      localStorage.setItem('lang', next);
      return next;
    });
  }, []);
  return { lang, t, toggleLang };
}
