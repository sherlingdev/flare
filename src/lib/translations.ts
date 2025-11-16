import en from '@/locales/en';
import es from '@/locales/es';
import fr from '@/locales/fr';
import pt from '@/locales/pt';
import de from '@/locales/de';
import zh from '@/locales/zh';
export const translations = {
    en,
    es,
    fr,
    pt,
    de,
    zh,
};

export type SupportedLocale = keyof typeof translations;



