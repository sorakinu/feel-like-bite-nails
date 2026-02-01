import { useMemo } from 'react';

type TranslationKey = 
  | 'smoothWithWind'
  | 'writeYourFeelings'
  | 'drawHint'
  | 'send';

const translations: Record<'en' | 'ja', Record<TranslationKey, string>> = {
  en: {
    smoothWithWind: 'Smooth with Wind',
    writeYourFeelings: 'Write your feelings...',
    drawHint: 'Draw until your mind is at ease.',
    send: 'Send',
  },
  ja: {
    smoothWithWind: '風でならす',
    writeYourFeelings: '想いを砂に...',
    drawHint: '気が済むまで描いてください',
    send: '送信',
  },
};

export const useLanguage = () => {
  const locale = useMemo(() => {
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('ja') ? 'ja' : 'en';
  }, []);

  const t = (key: TranslationKey): string => {
    return translations[locale][key];
  };

  return { locale, t };
};
