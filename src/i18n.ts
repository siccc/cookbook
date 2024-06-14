import { createI18n } from 'vue-i18n';
import messages from '@intlify/vite-plugin-vue-i18n/messages';
import type { Language } from './types';

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  useScope: 'global',
  locale: 'en', // set default locale
  fallbackLocale: 'en',
  messages
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
  const res = await fetch(`./lang/${locale}.json`)
  if (!res.ok) {
    throw new Error("Something went wrong during changing the language.");
  }
  return res.json();
}
