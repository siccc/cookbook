import { createI18n } from 'vue-i18n';
import type { Language } from './types';

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  useScope: 'global',
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
  const res = await fetch(`src/lang/${locale}.json`)
  if (!res.ok) {
    throw new Error('Something went wrong during loading locale.');
  }
  return res.json();
}
