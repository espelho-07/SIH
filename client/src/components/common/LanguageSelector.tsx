import React from 'react'
import { Globe, ChevronDown } from 'lucide-react'
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
      <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" aria-hidden="true" />
      <select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value)}
        className="text-xs font-medium pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5147] appearance-none cursor-pointer transition-colors shadow-2xs"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" aria-hidden="true" />
    </div>
  )
}

