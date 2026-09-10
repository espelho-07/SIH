import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
} from 'lucide-react'
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant'
import { assistantService } from '@/services/assistantService'
import { AssistantActionCard } from './AssistantActionCard'
import { AssistantDisclaimerBanner } from './AssistantDisclaimerBanner'
import { AssistantConfirmModal } from './AssistantConfirmModal'
import { VoiceControlBar } from './VoiceControlBar'
import type {
  AssistantMessage,
  AssistantProposedAction,
  ContextualSuggestion,
} from '@/types/assistant'

interface HealthcareAssistantDrawerProps {
  isOpen: boolean
  onClose: () => void
}

let drawerMessageCounter = 0
const createDrawerMessageId = (prefix: string) => `${prefix}-${++drawerMessageCounter}`

const INITIAL_MESSAGE: AssistantMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  text: 'Hello! I am your HealthConnect Assistant. I can help you find nearby government hospitals, check your live OPD queue token, view your upcoming appointments, track referrals, or check medicine availability. How can I help you today?',
  timestamp: 'Just now',
  intent: 'UNKNOWN',
  quickReplies: [
    'Find a Government Hospital',
    'What is my Queue Token?',
    'Show My Upcoming Appointment',
    'Where is my Prescription?',
  ],
}

export const HealthcareAssistantDrawer: React.FC<HealthcareAssistantDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([INITIAL_MESSAGE])
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([])
  const [isProcessingQuery, setIsProcessingQuery] = useState(false)
  const [confirmingAction, setConfirmingAction] = useState<AssistantProposedAction | null>(null)
  const [isExecutingAction, setIsExecutingAction] = useState(false)
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Voice Hook
  const {
    state: voiceState,
    isListening,
    isProcessing: isVoiceProcessing,
    isResponding,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    toggleTts,
    resetVoiceState,
  } = useVoiceAssistant({
    onTranscriptComplete: (transcript) => {
      handleSendQuery(transcript)
    },
  })

  // Load contextual suggestions when drawer opens
  useEffect(() => {
    if (isOpen) {
      assistantService.getContextualSuggestions().then(setSuggestions)
    }
  }, [isOpen])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (confirmingAction) {
          setConfirmingAction(null)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, confirmingAction, onClose])

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isProcessingQuery) return

    const userMessage: AssistantMessage = {
      id: createDrawerMessageId('usr'),
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsProcessingQuery(true)

    try {
      const response = await assistantService.processQuery(queryText.trim())
      setMessages((prev) => [...prev, response])

      // If voice audio response is enabled, speak the answer
      if (voiceState.ttsEnabled && response.text) {
        speakText(response.text)
      }
    } catch {
      const errorMsg: AssistantMessage = {
        id: createDrawerMessageId('err'),
        sender: 'assistant',
        text: 'I encountered an unexpected issue while processing your request. Please check your network or try asking in a different way.',
        timestamp: 'Just now',
        intent: 'UNKNOWN',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsProcessingQuery(false)
    }
  }

  const handleConfirmAction = async (action: AssistantProposedAction) => {
    setIsExecutingAction(true)
    try {
      const result = await assistantService.executeAction(action)
      if (result.success) {
        setActionSuccessNotice(result.message)
        setTimeout(() => setActionSuccessNotice(null), 4000)

        // Add confirmation message to chat
        const executionMessage: AssistantMessage = {
          id: createDrawerMessageId('exec'),
          sender: 'system',
          text: `✅ ${result.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, executionMessage])
      }
    } finally {
      setIsExecutingAction(false)
      setConfirmingAction(null)
    }
  }

  const handleClearHistory = () => {
    stopSpeaking()
    resetVoiceState()
    setMessages([INITIAL_MESSAGE])
  }

  if (!isOpen) return null

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="HealthConnect AI and Voice Assistant"
        className="fixed inset-0 z-50 overflow-hidden"
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
            {/* 1. Header */}
            <header className="p-4 border-b border-slate-200 bg-white/95 backdrop-blur-xs flex items-center justify-between gap-3 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0F5147] flex items-center justify-center text-white shadow-2xs">
                  <Bot className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                    <span>HealthConnect Assistant</span>
                    <span className="text-[10px] font-semibold bg-[#F2F9F8] text-[#0F5147] px-1.5 py-0.2 rounded border border-[#D0EAE6]">
                      AI • Voice
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Public Healthcare Navigation & Records
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title="Reset conversation"
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer touch-target"
                  aria-label="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer touch-target"
                  aria-label="Close assistant drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* 2. Success Alert Banner if action completed */}
            {actionSuccessNotice && (
              <div
                role="status"
                className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{actionSuccessNotice}</span>
              </div>
            )}

            {/* 3. Messages & Interactive Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Clinical boundary disclaimer banner */}
              <AssistantDisclaimerBanner />

              {/* Contextual Suggestions Chips */}
              {suggestions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0F5147]" />
                    <span>Suggested Quick Actions</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((sug) => (
                      <button
                        key={sug.id}
                        type="button"
                        onClick={() => handleSendQuery(sug.query)}
                        className={`text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 touch-target ${
                          sug.urgency === 'URGENT'
                            ? 'bg-red-50 hover:bg-red-100 text-red-900 border-red-200 font-semibold'
                            : sug.urgency === 'HIGH'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200 font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{sug.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message List */}
              <div className="space-y-4 pt-2">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user'
                  const isSystem = msg.sender === 'system'

                  if (isSystem) {
                    return (
                      <div
                        key={msg.id}
                        className="p-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium text-center"
                      >
                        {msg.text}
                      </div>
                    )
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div className="flex items-end gap-2 max-w-[92%]">
                        {!isUser && (
                          <div className="w-7 h-7 rounded-lg bg-[#0F5147] flex items-center justify-center text-white shrink-0 mb-0.5">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isUser
                              ? 'bg-[#0F5147] text-white rounded-br-xs shadow-2xs font-medium'
                              : msg.isEmergency
                              ? 'bg-red-50 text-red-950 border border-red-200 rounded-bl-xs shadow-2xs font-normal'
                              : 'bg-slate-100 text-slate-900 rounded-bl-xs shadow-2xs font-normal'
                          }`}
                        >
                          <div className="whitespace-pre-line">{msg.text}</div>

                          {/* Render Rich Structured Action Card if present */}
                          {!isUser && (
                            <AssistantActionCard
                              data={msg.structuredData}
                              proposedAction={msg.proposedAction}
                              onActionClick={(action) => setConfirmingAction(action)}
                            />
                          )}
                        </div>

                        {isUser && (
                          <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mb-0.5">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Quick reply chips under assistant reply */}
                      {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-9 pt-1">
                          {msg.quickReplies.map((qr, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSendQuery(qr)}
                              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors active:scale-95 cursor-pointer touch-target"
                            >
                              {qr}
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="text-[10px] text-slate-400 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 4. Bottom Voice & Text Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-white/95 backdrop-blur-xs">
              <VoiceControlBar
                voiceState={voiceState}
                isListening={isListening}
                isProcessing={isProcessingQuery || isVoiceProcessing}
                isResponding={isResponding}
                onStartListening={startListening}
                onStopListening={stopListening}
                onStopSpeaking={stopSpeaking}
                onToggleTts={toggleTts}
                onSendText={handleSendQuery}
                onResetVoice={resetVoiceState}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Consequential Action Confirmation Modal */}
      <AssistantConfirmModal
        action={confirmingAction}
        isOpen={!!confirmingAction}
        onClose={() => setConfirmingAction(null)}
        onConfirm={handleConfirmAction}
        isExecuting={isExecutingAction}
      />
    </>
  )
}
