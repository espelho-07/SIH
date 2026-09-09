import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DoorOpen,
  User,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  ArrowLeft,
  Building2,
  PhoneCall,
  Navigation,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { ActiveToken } from '@/types/queue'

export const LiveQueuePage: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [token, setToken] = useState<ActiveToken>({
    id: 'TKN-001',
    tokenNumber: 'B-042',
    facilityId: 'FAC-001',
    facilityName: 'Pandeypur District Hospital',
    departmentName: 'General Medicine & OPD',
    doctorName: 'Dr. Rajesh Verma (MBBS, MD)',
    roomNumber: 'Room 14 (Ground Floor, OPD Wing A)',
    status: 'ISSUED',
    priority: 'GENERAL',
    currentServingToken: 'B-031',
    positionInQueue: 11,
    estimatedWaitMinutes: 28,
    delayReason: 'Physician is reviewing an emergency trauma patient. An estimated 10-15 min delay is expected.',
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

  // Audio narration for accessibility
  const handleSpeakQueue = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true)
      const text = `Your token is B 42. Token B 31 is now being called in room 14 with Doctor Rajesh Verma. There are 11 patients ahead of you with an estimated wait time of 28 minutes.`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } else {
      alert(`Token #${token.tokenNumber}: Serving #${token.currentServingToken}. ${token.positionInQueue} ahead. Wait: ~${token.estimatedWaitMinutes} mins.`)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/patient/home"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5147] hover:text-[#0A3F37] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <button
          type="button"
          onClick={handleSpeakQueue}
          disabled={isSpeaking}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          aria-label="Listen to queue status"
        >
          <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-[#0F5147] animate-bounce' : 'text-slate-500'}`} />
          <span>{isSpeaking ? 'Reading status...' : 'Listen'}</span>
        </button>
      </div>

      {/* Delay Notification (Subtle & Calm) */}
      {token.delayReason && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <strong className="font-bold text-amber-950 block">Queue Delay Notice</strong>
            <p className="text-amber-800 leading-relaxed">{token.delayReason}</p>
          </div>
        </div>
      )}

      {/* Main Queue Card (Linear & Apple/Google Polished) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Top: Facility & Token Hero */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              {token.facilityName}
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase">Your Token</span>
              <h1 className="text-5xl font-mono font-extrabold text-[#0F5147] tracking-tight">
                {token.tokenNumber}
              </h1>
            </div>
            <p className="text-xs text-slate-600">{token.departmentName}</p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end gap-1.5">
            <Badge variant="success" className="text-xs px-2.5 py-0.5 font-semibold bg-emerald-50 text-emerald-800 border-emerald-200">
              ● Active in queue
            </Badge>
            <span className="text-[11px] text-slate-400 font-medium">Priority: General</span>
          </div>
        </div>

        {/* 3 Key Metrics: Single Glance Readability */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {/* Metric 1: Currently Calling */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wide">
              Now Calling
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 block">
              {token.currentServingToken}
            </span>
            <span className="text-[11px] text-slate-500 block">In Chamber 14</span>
          </div>

          {/* Metric 2: People Ahead */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wide">
              People Ahead
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 block">
              {token.positionInQueue}
            </span>
            <span className="text-[11px] text-slate-500 block">Patients in line</span>
          </div>

          {/* Metric 3: Estimated Wait */}
          <div className="p-4 bg-[#F2F9F8] rounded-2xl border border-[#D1E5E2] space-y-1">
            <span className="text-[11px] font-semibold text-[#0F5147] uppercase block tracking-wide">
              Est. Wait
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#0F5147] block">
              ~{token.estimatedWaitMinutes}m
            </span>
            <span className="text-[11px] text-[#0F5147]/80 block">Dynamic SLA</span>
          </div>
        </div>

        {/* Linear Visual Progress: How long until my turn? */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Consultation Journey</span>
            <span className="text-[#0F5147]">11 slots away</span>
          </div>

          {/* Minimalist Progress Track */}
          <div className="relative py-2">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full" />
            <div className="relative flex items-center justify-between px-1">
              {/* Doctor Chamber */}
              <div className="flex flex-col items-center space-y-1 bg-slate-50/70 px-1">
                <div className="w-8 h-8 rounded-full bg-[#0F5147] text-white flex items-center justify-center shadow-xs">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">Doctor</span>
              </div>

              {/* Current Serving */}
              <div className="flex flex-col items-center space-y-1 bg-slate-50/70 px-1">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center">
                  31
                </div>
                <span className="text-[10px] font-semibold text-slate-700">In Room</span>
              </div>

              {/* Intermediate indicator */}
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-50/70 px-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>

              {/* Your Token */}
              <div className="flex flex-col items-center space-y-1 bg-slate-50/70 px-1">
                <div className="w-9 h-9 rounded-full bg-[#0F5147] text-white font-mono font-extrabold text-xs flex items-center justify-center ring-4 ring-[#D1E5E2] shadow-2xs">
                  42
                </div>
                <span className="text-[10px] font-bold text-[#0F5147]">Your Turn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consulting Physician & Chamber Context */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700">
            <User className="w-4 h-4 text-[#0F5147] shrink-0" aria-hidden="true" />
            <span className="text-slate-500">Physician:</span>
            <strong className="text-slate-900 font-semibold">{token.doctorName}</strong>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <DoorOpen className="w-4 h-4 text-[#0F5147] shrink-0" aria-hidden="true" />
            <span className="text-slate-500">Chamber:</span>
            <strong className="text-slate-900 font-semibold">{token.roomNumber}</strong>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <Building2 className="w-4 h-4 text-[#0F5147] shrink-0" aria-hidden="true" />
            <span className="text-slate-500">Facility:</span>
            <span className="text-slate-800">{token.facilityName}</span>
          </div>
        </div>

        {/* Actions: Arrival Check-In & Directions */}
        <div className="space-y-3 pt-2">
          {!isCheckedIn ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleCheckIn}
              leftIcon={<MapPin className="w-4 h-4" />}
              className="w-full font-bold text-sm py-3.5 rounded-xl shadow-xs transition-transform active:scale-98 min-h-[48px]"
            >
              I Have Arrived at the Hospital
            </Button>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2.5 text-emerald-900 text-xs sm:text-sm font-semibold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Arrival Confirmed • Please be seated near Chamber 14</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1">
            <button
              type="button"
              onClick={() => alert('Navigation instructions opened via maps')}
              className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => alert('Calling hospital reception desk...')}
              className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Contact Hospital Desk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
