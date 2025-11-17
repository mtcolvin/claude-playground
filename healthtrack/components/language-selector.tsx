'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, Check, ChevronRight } from 'lucide-react'
import { i18n, type Locale, localeInfo, type TranslationKeys } from '@/lib/i18n'

export function LanguageSelector() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('en-US')
  const [isRTL, setIsRTL] = useState(false)

  useEffect(() => {
    // Detect browser locale on mount
    const browserLocale = i18n.detectBrowserLocale()
    setCurrentLocale(browserLocale)
    setIsRTL(localeInfo[browserLocale].direction === 'rtl')
  }, [])

  const handleLocaleChange = (locale: Locale) => {
    i18n.setLocale(locale)
    setCurrentLocale(locale)
    setIsRTL(localeInfo[locale].direction === 'rtl')

    // Reload page to apply changes throughout the app
    window.location.reload()
  }

  const availableLocales: Locale[] = [
    'en-US',
    'es-ES',
    'fr-FR',
    'de-DE',
    'zh-CN',
    'ja-JP',
    'ar-SA',
    'pt-BR'
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Globe className="h-8 w-8 text-blue-600" />
          {i18n.t('language_settings')}
        </h1>
        <p className="text-muted-foreground">
          Choose your preferred language and regional settings
        </p>
      </div>

      {/* Current Language Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Language</CardTitle>
          <CardDescription>
            Your selected language and regional format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Language</p>
              <p className="font-semibold text-lg">{localeInfo[currentLocale].nativeName}</p>
              <p className="text-xs text-muted-foreground">{localeInfo[currentLocale].englishName}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Text Direction</p>
              <p className="font-semibold text-lg">
                {localeInfo[currentLocale].direction === 'rtl' ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
              </p>
              <Badge variant={isRTL ? 'default' : 'outline'} className="mt-1">
                {isRTL ? 'RTL Enabled' : 'LTR'}
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Measurement System</p>
              <p className="font-semibold text-lg capitalize">
                {localeInfo[currentLocale].measurementSystem}
              </p>
              <p className="text-xs text-muted-foreground">
                {localeInfo[currentLocale].measurementSystem === 'metric'
                  ? 'kg, cm, °C'
                  : 'lbs, inches, °F'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Language</CardTitle>
          <CardDescription>
            Choose from {availableLocales.length} supported languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {availableLocales.map((locale) => {
              const info = localeInfo[locale]
              const isSelected = locale === currentLocale

              return (
                <button
                  key={locale}
                  onClick={() => handleLocaleChange(locale)}
                  className={`
                    p-4 border-2 rounded-lg text-left transition-all
                    ${isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{info.nativeName}</p>
                      <p className="text-xs text-muted-foreground">{info.englishName}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {locale}
                    </Badge>
                    {info.direction === 'rtl' && (
                      <Badge variant="secondary" className="text-xs">
                        RTL
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs capitalize">
                      {info.measurementSystem}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Format Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Format Preview</CardTitle>
          <CardDescription>
            See how dates, numbers, and units appear in your selected language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Date & Time Formats */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-semibold mb-3">Date & Time</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date Format:</span>
                  <span className="font-mono">{localeInfo[currentLocale].dateFormat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Format:</span>
                  <span className="font-mono">{localeInfo[currentLocale].timeFormat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Example Date:</span>
                  <span className="font-medium">{i18n.formatDate(new Date())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Example Time:</span>
                  <span className="font-medium">{i18n.formatTime(new Date())}</span>
                </div>
              </div>
            </div>

            {/* Number & Currency Formats */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-semibold mb-3">Numbers & Currency</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-mono">{localeInfo[currentLocale].currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number (1234.56):</span>
                  <span className="font-medium">{i18n.formatNumber(1234.56, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency ($99.99):</span>
                  <span className="font-medium">{i18n.formatCurrency(99.99)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Large Number:</span>
                  <span className="font-medium">{i18n.formatNumber(1234567.89, 2)}</span>
                </div>
              </div>
            </div>

            {/* Unit Conversions */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-semibold mb-3">Weight & Height</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">70 kg:</span>
                  <span className="font-medium">
                    {localeInfo[currentLocale].measurementSystem === 'metric'
                      ? '70.0 kg'
                      : `${i18n.convertWeight(70, 'kg', 'lbs').toFixed(1)} lbs`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">175 cm:</span>
                  <span className="font-medium">
                    {localeInfo[currentLocale].measurementSystem === 'metric'
                      ? '175.0 cm'
                      : `${i18n.convertHeight(175, 'cm', 'in').toFixed(1)} inches`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System:</span>
                  <Badge variant="outline" className="capitalize">
                    {localeInfo[currentLocale].measurementSystem}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Temperature */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-semibold mb-3">Temperature</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Body Temp (37°C):</span>
                  <span className="font-medium">
                    {localeInfo[currentLocale].measurementSystem === 'metric'
                      ? '37.0°C'
                      : `${i18n.convertTemperature(37, 'C', 'F').toFixed(1)}°F`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Temp (20°C):</span>
                  <span className="font-medium">
                    {localeInfo[currentLocale].measurementSystem === 'metric'
                      ? '20.0°C'
                      : `${i18n.convertTemperature(20, 'C', 'F').toFixed(1)}°F`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit:</span>
                  <Badge variant="outline">
                    {localeInfo[currentLocale].measurementSystem === 'metric' ? '°C' : '°F'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translation Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Coverage</CardTitle>
          <CardDescription>
            Common UI elements translated in your language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {(['dashboard', 'appointments', 'medications', 'metrics', 'reports', 'settings'] as (keyof TranslationKeys)[]).map((key) => (
              <div key={key} className="flex items-center gap-2 p-2 border rounded">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{i18n.t(key)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supported Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Internationalization Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Language Support:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  8 languages (EN, ES, FR, DE, ZH, JA, AR, PT)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Native language names
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Right-to-Left (RTL) support for Arabic
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Browser locale auto-detection
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Regional Formats:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Locale-specific date/time formats
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Number formatting (decimals, thousands)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Currency symbols and formatting
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Metric/Imperial unit conversions
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Changing your language will reload the application to apply the new settings.
          Your data and preferences will be preserved. Medical terms and content are translated by
          professional healthcare translators for accuracy.
        </p>
      </div>
    </div>
  )
}
