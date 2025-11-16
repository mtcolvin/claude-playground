/**
 * Internationalization (i18n) and Localization (l10n) System
 *
 * Supports multiple languages and regional formats for global accessibility.
 */

export type Locale = 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'zh-CN' | 'ja-JP' | 'ar-SA' | 'pt-BR'

export interface TranslationKeys {
  // Common
  'common.loading': string
  'common.error': string
  'common.save': string
  'common.cancel': string
  'common.delete': string
  'common.edit': string
  'common.add': string
  'common.search': string
  'common.filter': string
  'common.close': string

  // Navigation
  'nav.dashboard': string
  'nav.metrics': string
  'nav.medications': string
  'nav.appointments': string
  'nav.reports': string
  'nav.settings': string

  // Health Metrics
  'metrics.bloodPressure': string
  'metrics.heartRate': string
  'metrics.glucose': string
  'metrics.weight': string
  'metrics.temperature': string
  'metrics.oxygenSaturation': string

  // Medical
  'medical.symptom': string
  'medical.diagnosis': string
  'medical.treatment': string
  'medical.prescription': string
  'medical.dosage': string
  'medical.frequency': string

  // Time
  'time.daily': string
  'time.weekly': string
  'time.monthly': string
  'time.yearly': string
  'time.today': string
  'time.yesterday': string
  'time.tomorrow': string

  // Status
  'status.active': string
  'status.inactive': string
  'status.completed': string
  'status.pending': string
  'status.cancelled': string
}

// Translation dictionaries
const translations: Record<Locale, Partial<TranslationKeys>> = {
  'en-US': {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.close': 'Close',

    'nav.dashboard': 'Dashboard',
    'nav.metrics': 'Health Metrics',
    'nav.medications': 'Medications',
    'nav.appointments': 'Appointments',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',

    'metrics.bloodPressure': 'Blood Pressure',
    'metrics.heartRate': 'Heart Rate',
    'metrics.glucose': 'Blood Glucose',
    'metrics.weight': 'Weight',
    'metrics.temperature': 'Temperature',
    'metrics.oxygenSaturation': 'Oxygen Saturation',

    'medical.symptom': 'Symptom',
    'medical.diagnosis': 'Diagnosis',
    'medical.treatment': 'Treatment',
    'medical.prescription': 'Prescription',
    'medical.dosage': 'Dosage',
    'medical.frequency': 'Frequency',

    'time.daily': 'Daily',
    'time.weekly': 'Weekly',
    'time.monthly': 'Monthly',
    'time.yearly': 'Yearly',
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.tomorrow': 'Tomorrow',

    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.completed': 'Completed',
    'status.pending': 'Pending',
    'status.cancelled': 'Cancelled',
  },

  'es-ES': {
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Añadir',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.close': 'Cerrar',

    'nav.dashboard': 'Panel de Control',
    'nav.metrics': 'Métricas de Salud',
    'nav.medications': 'Medicamentos',
    'nav.appointments': 'Citas',
    'nav.reports': 'Informes',
    'nav.settings': 'Configuración',

    'metrics.bloodPressure': 'Presión Arterial',
    'metrics.heartRate': 'Frecuencia Cardíaca',
    'metrics.glucose': 'Glucosa en Sangre',
    'metrics.weight': 'Peso',
    'metrics.temperature': 'Temperatura',
    'metrics.oxygenSaturation': 'Saturación de Oxígeno',

    'medical.symptom': 'Síntoma',
    'medical.diagnosis': 'Diagnóstico',
    'medical.treatment': 'Tratamiento',
    'medical.prescription': 'Prescripción',
    'medical.dosage': 'Dosificación',
    'medical.frequency': 'Frecuencia',

    'time.daily': 'Diario',
    'time.weekly': 'Semanal',
    'time.monthly': 'Mensual',
    'time.yearly': 'Anual',
    'time.today': 'Hoy',
    'time.yesterday': 'Ayer',
    'time.tomorrow': 'Mañana',

    'status.active': 'Activo',
    'status.inactive': 'Inactivo',
    'status.completed': 'Completado',
    'status.pending': 'Pendiente',
    'status.cancelled': 'Cancelado',
  },

  'fr-FR': {
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.close': 'Fermer',

    'nav.dashboard': 'Tableau de Bord',
    'nav.metrics': 'Métriques de Santé',
    'nav.medications': 'Médicaments',
    'nav.appointments': 'Rendez-vous',
    'nav.reports': 'Rapports',
    'nav.settings': 'Paramètres',

    'metrics.bloodPressure': 'Tension Artérielle',
    'metrics.heartRate': 'Fréquence Cardiaque',
    'metrics.glucose': 'Glycémie',
    'metrics.weight': 'Poids',
    'metrics.temperature': 'Température',
    'metrics.oxygenSaturation': 'Saturation en Oxygène',
  },

  'de-DE': {
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.add': 'Hinzufügen',
    'common.search': 'Suchen',
    'common.filter': 'Filtern',
    'common.close': 'Schließen',

    'nav.dashboard': 'Dashboard',
    'nav.metrics': 'Gesundheitsmetriken',
    'nav.medications': 'Medikamente',
    'nav.appointments': 'Termine',
    'nav.reports': 'Berichte',
    'nav.settings': 'Einstellungen',

    'metrics.bloodPressure': 'Blutdruck',
    'metrics.heartRate': 'Herzfrequenz',
    'metrics.glucose': 'Blutzucker',
    'metrics.weight': 'Gewicht',
    'metrics.temperature': 'Temperatur',
    'metrics.oxygenSaturation': 'Sauerstoffsättigung',
  },

  'zh-CN': {
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.add': '添加',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.close': '关闭',

    'nav.dashboard': '仪表板',
    'nav.metrics': '健康指标',
    'nav.medications': '药物',
    'nav.appointments': '预约',
    'nav.reports': '报告',
    'nav.settings': '设置',

    'metrics.bloodPressure': '血压',
    'metrics.heartRate': '心率',
    'metrics.glucose': '血糖',
    'metrics.weight': '体重',
    'metrics.temperature': '体温',
    'metrics.oxygenSaturation': '血氧饱和度',
  },

  'ja-JP': {
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.add': '追加',
    'common.search': '検索',
    'common.filter': 'フィルター',
    'common.close': '閉じる',

    'nav.dashboard': 'ダッシュボード',
    'nav.metrics': '健康指標',
    'nav.medications': '薬',
    'nav.appointments': '予約',
    'nav.reports': 'レポート',
    'nav.settings': '設定',

    'metrics.bloodPressure': '血圧',
    'metrics.heartRate': '心拍数',
    'metrics.glucose': '血糖値',
    'metrics.weight': '体重',
    'metrics.temperature': '体温',
    'metrics.oxygenSaturation': '酸素飽和度',
  },

  'ar-SA': {
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.close': 'إغلاق',

    'nav.dashboard': 'لوحة المعلومات',
    'nav.metrics': 'المؤشرات الصحية',
    'nav.medications': 'الأدوية',
    'nav.appointments': 'المواعيد',
    'nav.reports': 'التقارير',
    'nav.settings': 'الإعدادات',

    'metrics.bloodPressure': 'ضغط الدم',
    'metrics.heartRate': 'معدل ضربات القلب',
    'metrics.glucose': 'سكر الدم',
    'metrics.weight': 'الوزن',
    'metrics.temperature': 'درجة الحرارة',
    'metrics.oxygenSaturation': 'تشبع الأكسجين',
  },

  'pt-BR': {
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.add': 'Adicionar',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.close': 'Fechar',

    'nav.dashboard': 'Painel',
    'nav.metrics': 'Métricas de Saúde',
    'nav.medications': 'Medicamentos',
    'nav.appointments': 'Consultas',
    'nav.reports': 'Relatórios',
    'nav.settings': 'Configurações',

    'metrics.bloodPressure': 'Pressão Arterial',
    'metrics.heartRate': 'Frequência Cardíaca',
    'metrics.glucose': 'Glicose no Sangue',
    'metrics.weight': 'Peso',
    'metrics.temperature': 'Temperatura',
    'metrics.oxygenSaturation': 'Saturação de Oxigênio',
  },
}

// Locale metadata
export const localeInfo: Record<Locale, {
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  dateFormat: string
  timeFormat: '12h' | '24h'
  currency: string
  measurementSystem: 'metric' | 'imperial'
}> = {
  'en-US': {
    name: 'English (United States)',
    nativeName: 'English (United States)',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    measurementSystem: 'imperial'
  },
  'es-ES': {
    name: 'Spanish (Spain)',
    nativeName: 'Español (España)',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    measurementSystem: 'metric'
  },
  'fr-FR': {
    name: 'French (France)',
    nativeName: 'Français (France)',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    measurementSystem: 'metric'
  },
  'de-DE': {
    name: 'German (Germany)',
    nativeName: 'Deutsch (Deutschland)',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    measurementSystem: 'metric'
  },
  'zh-CN': {
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    direction: 'ltr',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'CNY',
    measurementSystem: 'metric'
  },
  'ja-JP': {
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: '24h',
    currency: 'JPY',
    measurementSystem: 'metric'
  },
  'ar-SA': {
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية (المملكة العربية السعودية)',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    currency: 'SAR',
    measurementSystem: 'metric'
  },
  'pt-BR': {
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'BRL',
    measurementSystem: 'metric'
  },
}

// Translation manager
export class I18nManager {
  private currentLocale: Locale = 'en-US'
  private fallbackLocale: Locale = 'en-US'

  setLocale(locale: Locale): void {
    this.currentLocale = locale

    // Update HTML dir attribute for RTL languages
    if (typeof document !== 'undefined') {
      document.documentElement.dir = localeInfo[locale].direction
      document.documentElement.lang = locale
    }
  }

  getLocale(): Locale {
    return this.currentLocale
  }

  t(key: keyof TranslationKeys, params?: Record<string, string | number>): string {
    const translation = translations[this.currentLocale]?.[key] ||
                       translations[this.fallbackLocale]?.[key] ||
                       key

    if (!params) return translation

    // Replace parameters
    return Object.entries(params).reduce(
      (str, [key, value]) => str.replace(`{{${key}}}`, String(value)),
      translation
    )
  }

  // Format date according to locale
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.currentLocale).format(date)
  }

  // Format time according to locale
  formatTime(date: Date): string {
    const format = localeInfo[this.currentLocale].timeFormat
    return new Intl.DateTimeFormat(this.currentLocale, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: format === '12h'
    }).format(date)
  }

  // Format number according to locale
  formatNumber(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat(this.currentLocale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  // Format currency according to locale
  formatCurrency(value: number): string {
    const currency = localeInfo[this.currentLocale].currency
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency
    }).format(value)
  }

  // Convert weight between metric and imperial
  convertWeight(value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number {
    if (from === to) return value
    if (from === 'kg' && to === 'lbs') return value * 2.20462
    if (from === 'lbs' && to === 'kg') return value / 2.20462
    return value
  }

  // Convert height between metric and imperial
  convertHeight(value: number, from: 'cm' | 'inches', to: 'cm' | 'inches'): number {
    if (from === to) return value
    if (from === 'cm' && to === 'inches') return value / 2.54
    if (from === 'inches' && to === 'cm') return value * 2.54
    return value
  }

  // Convert temperature
  convertTemperature(value: number, from: 'C' | 'F', to: 'C' | 'F'): number {
    if (from === to) return value
    if (from === 'C' && to === 'F') return (value * 9/5) + 32
    if (from === 'F' && to === 'C') return (value - 32) * 5/9
    return value
  }

  // Get measurement system for current locale
  getMeasurementSystem(): 'metric' | 'imperial' {
    return localeInfo[this.currentLocale].measurementSystem
  }

  // Detect browser locale
  detectBrowserLocale(): Locale {
    if (typeof navigator === 'undefined') return 'en-US'

    const browserLang = navigator.language || (navigator as any).userLanguage

    // Try exact match
    if (browserLang in translations) {
      return browserLang as Locale
    }

    // Try language code match (e.g., 'en' from 'en-GB')
    const langCode = browserLang.split('-')[0]
    const match = Object.keys(translations).find(locale => locale.startsWith(langCode))

    return (match as Locale) || 'en-US'
  }

  // Get available locales
  getAvailableLocales(): Locale[] {
    return Object.keys(translations) as Locale[]
  }

  // Check if locale is RTL
  isRTL(): boolean {
    return localeInfo[this.currentLocale].direction === 'rtl'
  }
}

// Export singleton instance
export const i18n = new I18nManager()

// React hook for translations (for use in components)
export function useTranslation() {
  return {
    t: (key: keyof TranslationKeys, params?: Record<string, string | number>) => i18n.t(key, params),
    locale: i18n.getLocale(),
    setLocale: (locale: Locale) => i18n.setLocale(locale),
    formatDate: (date: Date) => i18n.formatDate(date),
    formatTime: (date: Date) => i18n.formatTime(date),
    formatNumber: (value: number, decimals?: number) => i18n.formatNumber(value, decimals),
    formatCurrency: (value: number) => i18n.formatCurrency(value),
    isRTL: () => i18n.isRTL(),
  }
}
