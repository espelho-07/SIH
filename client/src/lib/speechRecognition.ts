export interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

export interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: () => void
  onresult: (event: SpeechRecognitionEventLike) => void
  onerror: () => void
  onend: () => void
  start: () => void
  stop?: () => void
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

export function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null

  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }

  return win.SpeechRecognition || win.webkitSpeechRecognition || null
}
