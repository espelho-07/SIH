import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  DoorOpen,
  User,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Stethoscope,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { ActiveToken } from '@/types/queue'

export const LiveQueuePage: React.FC = () => {
  const { t } = useTranslation()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [token, setToken] = useState<ActiveToken>({
    id: 'TKN-001',
    tokenNumber: 'B-042',
    facilityId: 'FAC-001',
    facilityName: 'Pandeypur District Hospital',
    departmentName: 'General Medicine & OPD',
    doctorName: 'Dr. Rajesh Verma (MBBS, MD)',
    roomNumber: 'Room 14 (कमरा 14, भूतल)',
    status: 'ISSUED',
    priority: 'GENERAL',
    currentServingToken: 'B-031',
    positionInQueue: 11,
    estimatedWaitMinutes: 28,
    delayReason: 'डॉक्टर साहब आपातकालीन ट्रॉमा मरीज देख रहे हैं। 10-15 मिनट की देरी हो सकती है।',
    issuedAtIso: new Date().toISOString(),
  })

  // Simulated queue countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setToken((prev) => ({
        ...prev,
        estimatedWaitMinutes: Math.max(1, prev.estimatedWaitMinutes - 1),
      }))
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const handleCheckIn = () => {
    setIsCheckedIn(true)
  }

  // Audio narration for illiterate patients
  const handleSpeakQueue = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true)
      const text = `आपका टोकन नंबर बी 42 है। वर्तमान में टोकन बी 31 चल रहा है। आपसे आगे 11 मरीज हैं। लगभग 28 मिनट प्रतीक्षा समय है। कमरा नंबर 14 पर जाएं।`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'hi-IN'
      utterance.rate = 0.9
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } else {
      alert(`टोकन #${token.tokenNumber}: अभी #${token.currentServingToken} चल रहा है। आपसे आगे ${token.positionInQueue} मरीज हैं। कमरा 14.`)
    }
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/patient/home"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ (Home)</span>
        </Link>
        <button
          type="button"
          onClick={handleSpeakQueue}
          disabled={isSpeaking}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer touch-target"
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-teal-600' : ''}`} />
          <span>{isSpeaking ? 'बोल रहे हैं...' : 'बोलकर सुनें (Listen)'}</span>
        </button>
      </div>

      {/* Delay Banner if doctor is attending trauma */}
      {token.delayReason && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-2xs animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="block font-bold text-amber-950 mb-0.5">
              कतार में थोड़ी देरी (OPD Queue Notice)
            </strong>
            <span>{token.delayReason}</span>
          </div>
        </div>
      )}

      {/* Main Token Digital Card (3-Second Comprehension) */}
      <Card className="border-teal-200 shadow-md p-5 sm:p-6 bg-white space-y-6">
        {/* Hospital & Token Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {token.facilityName}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xs font-semibold text-slate-600">{t('queue.tokenLabel')}:</span>
              <h1 className="text-4xl sm:text-5xl font-mono font-black text-teal-800 tracking-tight">
                {token.tokenNumber}
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1">{token.departmentName}</p>
          </div>

          <div className="flex sm:flex-col items-end gap-1.5">
            <Badge variant="success" className="text-xs px-2.5 py-0.5 font-bold">
              कतार सक्रिय (Active)
            </Badge>
            <span className="text-[11px] text-slate-500">
              प्राथमिकता: {token.priority}
            </span>
          </div>
        </div>

        {/* Big 4 Metrics Grid (Single Glance Readability) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          {/* 1. Serving Now */}
          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100">
            <span className="text-[10px] sm:text-xs text-teal-800 font-bold block uppercase tracking-wide">
              {t('patientHome.servingNow')}
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-teal-900 mt-1 block">
              {token.currentServingToken}
            </span>
            <span className="text-[10px] text-teal-700 block mt-0.5">डॉक्टर कक्ष में</span>
          </div>

          {/* 2. People Ahead */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] sm:text-xs text-slate-600 font-bold block uppercase tracking-wide">
              {t('patientHome.inLine')}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {token.positionInQueue}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">आपसे आगे मरीज</span>
          </div>

          {/* 3. Estimated Wait */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] sm:text-xs text-slate-600 font-bold block uppercase tracking-wide">
              {t('patientHome.estimatedWait')}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {token.estimatedWaitMinutes}m
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">लगभग समय</span>
          </div>

          {/* 4. Room */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] sm:text-xs text-slate-600 font-bold block uppercase tracking-wide">
              {t('patientHome.room')}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
              14
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">कमरा नंबर</span>
          </div>
        </div>

        {/* Visual Queue Journey (Doctor -> Serving -> In-between -> You) */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-3">
          <span className="text-xs font-bold text-slate-700 block">
            कतार की स्थिति (Live Queue Progress):
          </span>

          <div className="flex items-center justify-between relative px-2">
            {/* Connector bar */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />

            {/* Doctor Desk */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-xs">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1">डॉक्टर</span>
            </div>

            {/* Current Serving */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs animate-pulse">
                31
              </div>
              <span className="text-[10px] font-bold text-teal-800 mt-1">चल रहा है</span>
            </div>

            {/* Middle dots */}
            <div className="relative z-10 flex items-center gap-1.5 bg-slate-50 px-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </div>

            {/* Your Token */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-4 ring-amber-100">
                42
              </div>
              <span className="text-[10px] font-bold text-amber-800 mt-1">आपकी बारी</span>
            </div>
          </div>
        </div>

        {/* Doctor & Room Details */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-700" aria-hidden="true" />
            <strong className="text-slate-900">{t('queue.doctorOnDuty')}:</strong>
            <span>{token.doctorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-teal-700" aria-hidden="true" />
            <strong className="text-slate-900">{t('queue.roomLocation')}:</strong>
            <span>{token.roomNumber}</span>
          </div>
        </div>

        {/* Geofence Arrival Check-In Button (Large Touch Target) */}
        <div className="space-y-2.5 pt-2">
          {!isCheckedIn ? (
            <Button
              variant="accent"
              size="lg"
              onClick={handleCheckIn}
              leftIcon={<MapPin className="w-5 h-5" />}
              className="w-full text-sm sm:text-base font-bold py-3.5 shadow-sm active:scale-98 transition-transform min-h-[52px]"
            >
              {t('patientHome.arrivalBtn')}
            </Button>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-900 text-xs sm:text-sm font-bold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{t('patientHome.arrivalConfirmed')}</span>
            </div>
          )}

          <p className="text-center text-[11px] text-slate-500 leading-tight">
            अस्पताल पहुँचकर हाजिरी लगाना सुनिश्चित करता है कि आपका टोकन समय पर पुकारा जाए।
          </p>
        </div>
      </Card>
    </div>
  )
}

