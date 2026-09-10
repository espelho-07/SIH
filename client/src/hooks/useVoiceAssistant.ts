import { useState, useEffect, useRef, useCallback } from 'react'
import { getSpeechRecognition, type SpeechRecognitionInstance } from '@/lib/speechRecognition'
import type { VoiceErrorType, VoiceSessionState } from '@/types/assistant'

interface UseVoiceAssistantOptions {
  onTranscriptComplete?: (transcript: string) => void
  language?: string
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}) {
  const { onTranscriptComplete, language = 'en-IN' } = options

  const [sessionState, setSessionState] = useState<VoiceSessionState>({
    status: 'IDLE',
    transcript: '',
    interimTranscript: '',
    ttsEnabled: false,
  })

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const isListeningRef = useRef(false)
  const isSpeakingRef = useRef(false)

  // Speech synthesis helper
  const speakText = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      if (!sessionState.ttsEnabled) return

      try {
        window.speechSynthesis.cancel()

        // Clean markdown bold, asterisks, links for natural speech
        const cleanText = text
          .replace(/[*_#`[\]()]/g, '')
          .replace(/https?:\/\/\S+/g, '')
          .trim()

        if (!cleanText) return

        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.lang = language
        utterance.rate = 1.0
        utterance.pitch = 1.0

        utterance.onstart = () => {
          isSpeakingRef.current = true
          setSessionState((prev) => ({ ...prev, status: 'RESPONDING' }))
        }

        utterance.onend = () => {
          isSpeakingRef.current = false
          setSessionState((prev) => ({ ...prev, status: 'IDLE' }))
        }

        utterance.onerror = () => {
          isSpeakingRef.current = false
          setSessionState((prev) => ({ ...prev, status: 'IDLE' }))
        }

        window.speechSynthesis.speak(utterance)
      } catch {
        setSessionState((prev) => ({ ...prev, status: 'IDLE' }))
      }
    },
    [language, sessionState.ttsEnabled]
  )

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    isSpeakingRef.current = false
    setSessionState((prev) => (prev.status === 'RESPONDING' ? { ...prev, status: 'IDLE' } : prev))
  }, [])

  const toggleTts = useCallback(() => {
    setSessionState((prev) => {
      const next = !prev.ttsEnabled
      if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      return { ...prev, ttsEnabled: next }
    })
  }, [])

  // Start voice listening
  const startListening = useCallback(() => {
    stopSpeaking()

    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setSessionState((prev) => ({
        ...prev,
        status: 'ERROR',
        errorType: 'NOT_SUPPORTED',
        errorMessage: 'Voice recognition is not supported in this browser. Please use text input.',
      }))
      return
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop?.()
        } catch {
          // ignore
        }
      }

      const instance = new SpeechRecognition()
      instance.lang = language
      instance.continuous = false
      instance.interimResults = true

      instance.onstart = () => {
        isListeningRef.current = true
        setSessionState((prev) => ({
          ...prev,
          status: 'LISTENING',
          errorType: undefined,
          errorMessage: undefined,
          interimTranscript: '',
        }))
      }

      instance.onresult = (event) => {
        let final = ''
        let interim = ''

        // Web Speech API results parsing
        const results = event.results as unknown as SpeechRecognitionResultList
        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          if (result.isFinal) {
            final += result[0].transcript
          } else {
            interim += result[0].transcript
          }
        }

        if (final) {
          setSessionState((prev) => ({
            ...prev,
            transcript: final,
            interimTranscript: '',
            status: 'PROCESSING',
          }))
          isListeningRef.current = false
          onTranscriptComplete?.(final)
        } else if (interim) {
          setSessionState((prev) => ({
            ...prev,
            interimTranscript: interim,
          }))
        }
      }

      instance.onerror = (err?: unknown) => {
        isListeningRef.current = false
        const eventErr = (err as { error?: string })?.error

        let errorType: VoiceErrorType = 'UNKNOWN'
        let errorMessage = 'Voice recognition error occurred. Please try again or type.'

        if (eventErr === 'not-allowed' || eventErr === 'service-not-allowed') {
          errorType = 'PERMISSION_DENIED'
          errorMessage = 'Microphone access was denied. Please allow microphone permissions in your browser settings.'
        } else if (eventErr === 'no-speech') {
          errorType = 'NO_SPEECH'
          errorMessage = 'No voice input was detected. Tap the microphone and speak again.'
        } else if (eventErr === 'network') {
          errorType = 'NETWORK'
          errorMessage = 'Network connection issue during speech recognition.'
        }

        setSessionState((prev) => ({
          ...prev,
          status: 'ERROR',
          errorType,
          errorMessage,
          interimTranscript: '',
        }))
      }

      instance.onend = () => {
        isListeningRef.current = false
        setSessionState((prev) => {
          if (prev.status === 'LISTENING') {
            return { ...prev, status: 'IDLE', interimTranscript: '' }
          }
          return prev
        })
      }

      recognitionRef.current = instance
      instance.start()
    } catch {
      isListeningRef.current = false
      setSessionState((prev) => ({
        ...prev,
        status: 'ERROR',
        errorType: 'AUDIO_CAPTURE',
        errorMessage: 'Unable to start microphone audio capture. Please try typing.',
      }))
    }
  }, [language, onTranscriptComplete, stopSpeaking])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop?.()
      } catch {
        // ignore
      }
    }
    isListeningRef.current = false
    setSessionState((prev) => ({
      ...prev,
      status: 'IDLE',
      interimTranscript: '',
    }))
  }, [])

  const resetVoiceState = useCallback(() => {
    stopListening()
    stopSpeaking()
    setSessionState((prev) => ({
      ...prev,
      status: 'IDLE',
      transcript: '',
      interimTranscript: '',
      errorType: undefined,
      errorMessage: undefined,
    }))
  }, [stopListening, stopSpeaking])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.stop?.()
        } catch {
          // ignore
        }
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return {
    state: sessionState,
    isListening: sessionState.status === 'LISTENING',
    isProcessing: sessionState.status === 'PROCESSING',
    isResponding: sessionState.status === 'RESPONDING',
    isError: sessionState.status === 'ERROR',
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    toggleTts,
    resetVoiceState,
  }
}
