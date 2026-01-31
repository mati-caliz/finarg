import { useAppStore } from '@/store/useStore';
import { translations, TranslationKey, Language } from '@/i18n/translations';

const VALID_COUNTRIES = ['ar', 'co', 'cl', 'uy', 'br'];

type TranslationDict = Record<TranslationKey, string>;

export const useTranslation = () => {
  const selectedCountry = useAppStore((state) => state.selectedCountry);

  const getLanguage = (country: string | undefined): Language => {
    const code = (country || 'ar').toString().toLowerCase();
    if (!VALID_COUNTRIES.includes(code)) {
      return 'es';
    }
    if (code === 'br') {
      return 'pt';
    }
    return 'es';
  };

  const language = getLanguage(selectedCountry);

  const t = (key: TranslationKey): string => {
    const dict = translations[language] as TranslationDict;
    const fallback = translations.es as TranslationDict;
    return dict[key] ?? fallback[key] ?? key;
  };

  return { t, translate: t, language };
};
