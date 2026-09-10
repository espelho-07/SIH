import React, { useState, useEffect, useRef } from 'react'
import {
  RotateCcw,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
  Pill,
} from 'lucide-react'
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant'
import { assistantService } from '@/services/assistantService'
import { AssistantActionCard } from '@/components/assistant/AssistantActionCard'
import { AssistantDisclaimerBanner } from '@/components/assistant/AssistantDisclaimerBanner'
import { AssistantConfirmModal } from '@/components/assistant/AssistantConfirmModal'
import { VoiceControlBar } from '@/components/assistant/VoiceControlBar'
import type {
  AssistantMessage,
  AssistantProposedAction,
  ContextualSuggestion,
} from '@/types/assistant'

let pageMessageCounter = 0
const createPageMessageId = (prefix: string) => `${prefix}-${++pageMessageCounter}`

const INITIAL_MESSAGE: AssistantMessage = {
  id: 'msg-welcome-page',
  sender: 'assistant',
  text: `Welcome to the **HealthConnect Assistant**.

I am your intelligent public healthcare navigation assistant. You can speak or type your request in plain language:
• Find government hospitals and verified bed capacity
• Check your active OPD queue token and wait times
• View or reschedule upcoming doctor appointments
• Track hospital referral status and receiving facility
• Check lab test orders and diagnostic reports
• View your active prescribed medications and Jan Aushadhi generic availability
• Search verified blood stock across public blood banks

How can I help you today?`,
  timestamp: 'Just now',
  intent: 'UNKNOWN',
  quickReplies: [
    'Find a Government Hospital',
    'What is my Queue Token?',
    'Show My Upcoming Appointment',
    'Where is my Prescription?',
    'Check Blood Availability',
  ],
}

export const AssistantPage: React.FC = () => {
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

  // Load contextual recommendations
  useEffect(() => {
    assistantService.getContextualSuggestions().then(setSuggestions)
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isProcessingQuery) return

    const userMessage: AssistantMessage = {
      id: createPageMessageId('usr'),
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsProcessingQuery(true)

    try {
      const response = await assistantService.processQuery(queryText.trim())
      setMessages((prev) => [...prev, response])

      // If text-to-speech is enabled, speak answer
      if (voiceState.ttsEnabled && response.text) {
        speakText(response.text)
      }
    } catch {
      const errorMsg: AssistantMessage = {
        id: createPageMessageId('err'),
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

        const executionMessage: AssistantMessage = {
          id: createPageMessageId('exec'),
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Healthcare Assistant
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F2F9F8] text-[#0F5147] border border-[#D0EAE6]">
              AI • Voice
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Natural-language and voice navigation over verified public healthcare workflows and medical records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearHistory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 active:scale-95 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* 2. Clinical Disclaimer Banner */}
      <AssistantDisclaimerBanner />

      {/* 3. Action Success Banner if any */}
      {actionSuccessNotice && (
        <div
          role="status"
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-fade-in shadow-2xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* 4. Quick Workflow Category Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => handleSendQuery('Find government hospitals in Varanasi')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Building2 className="w-4 h-4 text-[#0F5147]" />
            <span>Hospitals & Beds</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Government facilities & ICU
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleSendQuery('What is my OPD queue token?')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Clock className="w-4 h-4 text-[#0F5147]" />
            <span>Live Queue</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Token status & wait times
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleSendQuery('Show my upcoming appointment')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Calendar className="w-4 h-4 text-[#0F5147]" />
            <span>Appointments</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Consultations & booking
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleSendQuery('Where is my prescription?')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Pill className="w-4 h-4 text-emerald-700" />
            <span>Medicines & Rx</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Active meds & Jan Aushadhi
          </p>
        </button>
      </div>

      {/* 5. Main Conversational Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Personalized Suggestions if available */}
          {suggestions.length > 0 && (
            <div className="space-y-1.5 pb-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0F5147]" />
                <span>Your Real-Time Healthcare Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug) => (
                  <button
                    key={sug.id}
                    type="button"
                    onClick={() => handleSendQuery(sug.query)}
                    className={`text-left text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 touch-target ${
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

          {/* Messages */}
          <div className="space-y-4">
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
                  <div className="flex items-end gap-2 max-w-[90%] sm:max-w-[80%]">
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-[#0F5147] flex items-center justify-center text-white shrink-0 mb-0.5 shadow-2xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#0F5147] text-white rounded-br-xs shadow-2xs font-medium'
                          : msg.isEmergency
                          ? 'bg-red-50 text-red-950 border border-red-200 rounded-bl-xs shadow-2xs font-normal'
                          : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-bl-xs shadow-2xs font-normal'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Render Structured Action Card */}
                      {!isUser && (
                        <AssistantActionCard
                          data={msg.structuredData}
                          proposedAction={msg.proposedAction}
                          onActionClick={(action) => setConfirmingAction(action)}
                        />
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mb-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Quick reply chips under assistant reply */}
                  {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-10 pt-1">
                      {msg.quickReplies.map((qr, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendQuery(qr)}
                          className="text-[11px] px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors active:scale-95 cursor-pointer touch-target"
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

        {/* Bottom Control Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/70">
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

      {/* Action Confirmation Modal */}
      <AssistantConfirmModal
        action={confirmingAction}
        isOpen={!!confirmingAction}
        onClose={() => setConfirmingAction(null)}
        onConfirm={handleConfirmAction}
        isExecuting={isExecutingAction}
      />
    </div>
  )
}
