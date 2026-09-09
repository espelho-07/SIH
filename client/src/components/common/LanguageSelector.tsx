import React from 'react'
import { Globe } from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'

export const LanguageSelector: React.FC = () => {
  const currentLanguage = useUiStore((state) => state.currentLanguage)
  const setLanguage = useUiStore((state) => state.setLanguage)

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
  ]

  return (
    <div className="relative inline-flex items-center">
      <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 pointer-events-none" aria-hidden="true" />
      <select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value)}
        className="text-xs font-semibold pl-8 pr-6 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 appearance-none cursor-pointer"
        aria-label="Select platform language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
