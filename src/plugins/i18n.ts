import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import ja from '@/locales/ja.json'
import de from '@/locales/de.json'
import es from '@/locales/es.json'

/**
 * i18n Configuration
 *
 * - Supports 4 languages: English, Japanese, German, Spanish
 * - Uses Composition API mode (legacy: false)
 * - Persists language preference in localStorage
 */

// Get saved language from localStorage or default to English
const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    ja,
    de,
    es,
  },
})

export default i18n
