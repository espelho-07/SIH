import React, { useState } from 'react'
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertCircle,
  Square,
} from 'lucide-react'
import type { VoiceSessionState } from '@/types/assistant'

interface VoiceControlBarProps {
  voiceState: VoiceSessionState
  isListening: boolean
  isProcessing: boolean
  isResponding: boolean
  onStartListening: () => void
  onStopListening: () => void
  onStopSpeaking: () => void
  onToggleTts: () => void
  onSendText: (text: string) => void
  onResetVoice: () => void
  className?: string
}

export const VoiceControlBar: React.FC<VoiceControlBarProps> = ({
  voiceState,
  isListening,
  isProcessing,
  isResponding,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onToggleTts,
  onSendText,
  onResetVoice,
  className = '',
}) => {
  const [inputText, setInputText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim() && !isProcessing) {
      onSendText(inputText.trim())
      setInputText('')
    }
  }

  const handleMicClick = () => {
    if (isResponding) {
      onStopSpeaking()
      return
    }
    if (isListening) {
      onStopListening()
    } else {
      onStartListening()
    }
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* 1. Voice State Feedback Banner (when active or errored) */}
      {isListening && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-xs text-red-900 shadow-2xs animate-fade-in"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-red-950">Listening...</span>
              <p className="text-red-700 text-[11px]">
                {voiceState.interimTranscript
                  ? `"${voiceState.interimTranscript}"`
                  : 'Speak your question (e.g. "When is my appointment?" or "Find cardiology hospital")'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStopListening}
            className="px-2.5 py-1 bg-white hover:bg-red-100 text-red-800 border border-red-200 rounded-lg text-[11px] font-bold active:scale-95 transition-transform cursor-pointer"
          >
            Done Speaking
          </button>
        </div>
      )}

      {isProcessing && (
        <div
          role="status"
          aria-live="polite"
          className="p-2.5 bg-[#F2F9F8] border border-[#D0EAE6] rounded-xl flex items-center gap-2.5 text-xs text-emerald-950 shadow-2xs animate-fade-in"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0F5147] animate-spin shrink-0" />
          <span className="font-medium text-slate-700">
            Processing healthcare query...
          </span>
        </div>
      )}

      {isResponding && (
        <div
          role="status"
          aria-live="polite"
          className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950 shadow-2xs animate-fade-in"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-700 animate-pulse shrink-0" />
            <span className="font-medium text-emerald-900">
              Reading assistant response aloud...
            </span>
          </div>
          <button
            type="button"
            onClick={onStopSpeaking}
            className="p-1 text-emerald-800 hover:bg-emerald-100 rounded-md transition-colors"
            aria-label="Stop audio response"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      )}

      {voiceState.status === 'ERROR' && (
        <div
          role="alert"
          className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-2.5 text-xs text-amber-900 shadow-2xs animate-fade-in"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">Voice Notice:</span>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                {voiceState.errorMessage || 'Audio not captured. Please retry or continue by typing.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResetVoice}
            className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer active:scale-95 transition-transform"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Primary Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-white rounded-2xl border border-slate-300 shadow-sm focus-within:border-[#0F5147] focus-within:ring-2 focus-within:ring-[#0F5147]/10 p-1.5 sm:p-2 transition-all"
      >
        {/* Voice Toggle Button */}
        <button
          type="button"
          onClick={handleMicClick}
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-all touch-target cursor-pointer ${
            isListening
              ? 'bg-red-600 text-white shadow-md shadow-red-200 animate-pulse ring-2 ring-red-300'
              : isResponding
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-[#F2F9F8] text-[#0F5147] hover:bg-[#E2F2EF] border border-[#D0EAE6]'
          }`}
          aria-label={
            isListening
              ? 'Stop voice recording'
              : isResponding
              ? 'Stop audio response'
              : 'Speak voice query'
          }
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : isResponding ? (
            <Square className="w-4 h-4 fill-white text-white" />
          ) : (
            <Mic className="w-5 h-5 text-[#0F5147]" />
          )}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? 'Listening to speech...'
              : 'Ask: "Hospitals nearby", "Check my queue", "My appointments"...'
          }
          disabled={isProcessing}
          className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          aria-label="Ask healthcare question or workflow"
        />

        {/* TTS Toggle Button */}
        <button
          type="button"
          onClick={onToggleTts}
          className={`p-2 rounded-xl text-xs transition-colors shrink-0 cursor-pointer touch-target ${
            voiceState.ttsEnabled
              ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          aria-label={voiceState.ttsEnabled ? 'Disable spoken voice replies' : 'Enable spoken voice replies'}
          title={voiceState.ttsEnabled ? 'Spoken replies enabled' : 'Spoken replies muted'}
        >
          {voiceState.ttsEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-700" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Send Submit Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className="ml-1 w-10 h-10 rounded-xl bg-[#0F5147] hover:bg-[#0B3D35] disabled:opacity-40 disabled:hover:bg-[#0F5147] text-white flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-2xs touch-target cursor-pointer"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
