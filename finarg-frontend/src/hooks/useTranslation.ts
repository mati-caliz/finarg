import { useAppStore } from '@/store/useStore';
import { translations, TranslationKey, Language } from '@/i18n/translations';

export const useTranslation = () => {
  const selectedCountry = useAppStore((state) => state.selectedCountry);

  const getLanguage = (country: string | undefined): Language => {
    const code = (country || 'ar').toString().toLowerCase();
    switch (code) {
      case 'br':
        return 'pt';
      case 'ar':
      case 'co':
      case 'cl':
      case 'uy':
        return 'es';
      default:
        return 'en';
    }
  };

  const language = getLanguage(selectedCountry);
  const translate = (key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return { translate, language };
};
