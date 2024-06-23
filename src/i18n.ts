import { createI18n } from 'vue-i18n';
import type { Language } from './types';

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  useScope: 'global',
  missingWarn: false,
  fallbackWarn: false,
  missing(locale, key) {
    return '\xa0';
  },
})

export async function setLocale (locale: Language) {
  // add new locale
  if (!i18n.global.availableLocales.includes(locale)) {
    const messages = await loadLocale(locale);
    if (messages === undefined) {
      return;
    }
    i18n.global.setLocaleMessage(locale, messages);
  }
  // set locale
  i18n.global.locale.value = locale;
}

async function loadLocale(locale: Language) {
  return (await import(`@/lang/${locale}.json`)).default
}
