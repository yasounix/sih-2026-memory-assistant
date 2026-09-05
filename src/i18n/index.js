import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import en from '../translations/en.json';
import as from '../translations/as.json';
import bn from '../translations/bn.json';
import hi from '../translations/hi.json';

export const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'as', label: 'Assamese', nativeLabel: 'অসমীয়া', flag: '🌿' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flag: '🌸' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
];

const translations = {
  en,
  as,
  bn,
  hi,
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export function getDeviceLanguage() {
  try {
    const locales = Localization.getLocales ? Localization.getLocales() : [];
    if (locales && locales.length > 0 && locales[0].languageCode) {
      const code = locales[0].languageCode.toLowerCase();
      if (translations[code]) {
        return code;
      }
    }
  } catch (e) {
    console.warn('Failed to detect device language:', e);
  }
  return 'en';
}

// Initial locale setup
i18n.locale = getDeviceLanguage();

export function setLanguage(lang) {
  if (translations[lang]) {
    i18n.locale = lang;
    return lang;
  }
  i18n.locale = 'en';
  return 'en';
}

export function getLanguage() {
  return i18n.locale || 'en';
}

export function getAvailableLanguages() {
  return AVAILABLE_LANGUAGES;
}

export function t(key, params = {}) {
  try {
    const result = i18n.t(key, params);
    // If i18n-js returns missing translation string, fallback to en translation or key
    if (typeof result === 'string' && result.startsWith('[missing')) {
      const keys = key.split('.');
      let val = en;
      for (const k of keys) {
        if (val && typeof val === 'object' && k in val) {
          val = val[k];
        } else {
          val = null;
          break;
        }
      }
      if (typeof val === 'string') {
        let interpolated = val;
        for (const [pKey, pVal] of Object.entries(params)) {
          interpolated = interpolated.replace(new RegExp(`%\\{${pKey}\\}`, 'g'), String(pVal));
        }
        return interpolated;
      }
      return key;
    }
    return result;
  } catch (err) {
    return key;
  }
}

export { i18n };
export default i18n;

