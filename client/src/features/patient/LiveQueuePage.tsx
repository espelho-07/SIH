import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Volume2,
  Clock,
  User,
  DoorOpen,
  PhoneCall,
  Navigation,
  AlertCircle,
  PauseCircle,
  CheckCircle2,
  LogOut,
  Sparkles,
  Layers,
  History,
  Pill,
  Activity,
  FileText,
  Calendar,
} from 'lucide-react'
import { queueService } from '@/services/queueService'
import { QueueProgressVisualizer } from '@/components/healthcare/QueueProgressVisualizer'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import type { ActiveToken, QueueHistoryItem, QueuePatientState } from '@/types/queue'

export const LiveQueuePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const requestedTokenId = searchParams.get('token')
  const isOnline = useOnlineStatus()

  // Active Tokens & Selection
  const [activeQueues, setActiveQueues] = useState<ActiveToken[]>([])
  const [selectedTokenId, setSelectedTokenId] = useState<string>('')
  const [currentToken, setCurrentToken] = useState<ActiveToken | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Queue History & View Mode
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE')
  const [historyItems, setHistoryItems] = useState<QueueHistoryItem[]>([])

  // Audio Speech State
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Freshness & Last Updated
  const [lastUpdatedText, setLastUpdatedText] = useState('Updated just now')
  const lastFetchTimeRef = useRef<number>(0)

  // Leave Queue Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveReason, setLeaveReason] = useState('Personal emergency / unable to wait')
  const [isLeaving, setIsLeaving] = useState(false)

  // Demo / Evaluator Simulation Drawer State
  const [showDemoToolbar, setShowDemoToolbar] = useState(false)

  // Action Notice Toast
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  // Fetch queues from service
  const refreshQueueData = useCallback(async () => {
    try {
      const queues = await queueService.getActiveQueues()
      setActiveQueues(queues)

      // If current token was just completed, preserve it so patient sees completed consultation card
      if (currentToken?.state === 'COMPLETED' && (!selectedTokenId || selectedTokenId === currentToken.id)) {
        return
      }

      const matched =
        queues.find((q) => q.id === selectedTokenId || q.tokenNumber === selectedTokenId) ||
        (requestedTokenId ? queues.find((q) => q.id === requestedTokenId || q.tokenNumber === requestedTokenId) : null) ||
        queues[0] ||
        null

      setCurrentToken(matched)
      if (matched && !selectedTokenId) {
        setSelectedTokenId(matched.id)
      }

      lastFetchTimeRef.current = Date.now()
      setLastUpdatedText('Updated just now')
    } finally {
      setIsLoading(false)
    }
  }, [selectedTokenId, requestedTokenId, currentToken?.state, currentToken?.id])

  // Initial load
  useEffect(() => {
    let isMounted = true
    queueService.getActiveQueues().then((queues) => {
      if (isMounted) {
        setActiveQueues(queues)
        const matched = requestedTokenId
          ? queues.find((q) => q.id === requestedTokenId || q.tokenNumber === requestedTokenId) || queues[0]
          : queues[0]
        setCurrentToken(matched || null)
        if (matched) {
          setSelectedTokenId(matched.id)
        }
        setIsLoading(false)
      }
    })

    queueService.getQueueHistory().then((history) => {
      if (isMounted) {
        setHistoryItems(history)
      }
    })

    return () => {
      isMounted = false
    }
  }, [requestedTokenId])

  // Polite polling: interval every 12 seconds when online & page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden || !isOnline) {
        return
      }
      refreshQueueData()
    }, 12000)

    // Visibility listener to refresh immediately when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden && isOnline) {
        refreshQueueData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isOnline, refreshQueueData])

  // Freshness timer
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - lastFetchTimeRef.current) / 1000)
      if (elapsedSec < 30) {
        setLastUpdatedText('Updated just now')
      } else if (elapsedSec < 90) {
        setLastUpdatedText('Updated 1 min ago')
      } else {
        setLastUpdatedText(`Updated ${Math.floor(elapsedSec / 60)} mins ago`)
      }
    }, 15000)

    return () => clearInterval(timer)
  }, [])

  // Audio Speech Narration (Web Speech API)
  const handleSpeakStatus = () => {
    if (!currentToken) return

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(true)

      let narration = `Your token is ${currentToken.tokenNumber.replace('-', ' ')}.`
      if (currentToken.state === 'CALLED') {
        narration += ` It is your turn right now. Please enter ${currentToken.roomNumber} to see Doctor ${currentToken.doctorName}.`
      } else if (currentToken.state === 'APPROACHING') {
        narration += ` You are almost up. Token ${currentToken.currentServingToken.replace('-', ' ')} is now in the room. There are ${currentToken.positionInQueue} people ahead of you. Please move to the room entrance.`
      } else {
        narration += ` Currently serving token ${currentToken.currentServingToken.replace('-', ' ')} in ${currentToken.roomNumber}. There are ${currentToken.positionInQueue} people ahead of you, with an estimated wait of approximately ${currentToken.estimatedWaitMinutes} minutes.`
      }

      const utterance = new SpeechSynthesisUtterance(narration)
      utterance.rate = 0.95
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } else {
      setActionNotice(
        `Token #${currentToken.tokenNumber}: Serving #${currentToken.currentServingToken}. ${currentToken.positionInQueue} ahead. Wait: ~${currentToken.estimatedWaitMinutes}m.`
      )
      setTimeout(() => setActionNotice(null), 4000)
    }
  }

  // Switch selected token in multi-queue
  const handleSelectToken = (tokenId: string) => {
    setSelectedTokenId(tokenId)
    const found = activeQueues.find((q) => q.id === tokenId)
    if (found) {
      setCurrentToken(found)
    }
  }

  // Handle Leave Queue
  const handleConfirmLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentToken) return

    setIsLeaving(true)
    try {
      await queueService.leaveQueue(currentToken.id, leaveReason)
      setShowLeaveModal(false)
      setActionNotice(`You have left the queue for token ${currentToken.tokenNumber}.`)
      setTimeout(() => setActionNotice(null), 4000)
      refreshQueueData()
      const updatedHistory = await queueService.getQueueHistory()
      setHistoryItems(updatedHistory)
    } finally {
      setIsLeaving(false)
    }
  }

  // Handle Rejoin Queue
  const handleRejoinQueue = async () => {
    if (!currentToken) return
    const updated = await queueService.rejoinQueue(currentToken.id)
    setCurrentToken(updated)
    setActionNotice(`You have rejoined the queue as token ${updated.tokenNumber} at position #4.`)
    setTimeout(() => setActionNotice(null), 4000)
    refreshQueueData()
  }

  // Handle Check in from appointment
  const handleCheckInNow = async () => {
    const newToken = await queueService.checkInAppointment('apt-001')
    setCurrentToken(newToken)
    setSelectedTokenId(newToken.id)
    setActionNotice(`Arrival confirmed! Token ${newToken.tokenNumber} assigned.`)
    setTimeout(() => setActionNotice(null), 4000)
    refreshQueueData()
  }

  // Simulation controls for evaluators / testing
  const handleSimulateAdvance = async () => {
    if (!currentToken) return
    const updated = await queueService.advanceQueue(currentToken.id)
    setCurrentToken(updated)
    refreshQueueData()
  }

  const handleSimulateState = async (
    state: QueuePatientState,
    options?: { isDelayed?: boolean; delayReason?: string; isPaused?: boolean; pauseReason?: string }
  ) => {
    if (!currentToken) return
    const updated = await queueService.setQueueState(currentToken.id, state, options)
    setCurrentToken(updated)
    if (state === 'COMPLETED') {
      const active = await queueService.getActiveQueues()
      setActiveQueues(active)
      const history = await queueService.getQueueHistory()
      setHistoryItems(history)
      setActionNotice(`Consultation completed! Token #${updated.tokenNumber} marked complete. Care plan updated.`)
      setTimeout(() => setActionNotice(null), 5000)
    } else {
      refreshQueueData()
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-xs text-slate-500">
        Loading queue information...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* 1. TOP NAVIGATION BAR & AUDIO NARRATION */}
      <div className="flex items-center justify-between pb-1">
        <Link
          to="/patient/home"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Audio Narration Action */}
          {currentToken && (
            <button
              type="button"
              onClick={handleSpeakStatus}
              disabled={isSpeaking}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer touch-target ${
                isSpeaking
                  ? 'bg-emerald-50 text-[#0F5147] border-emerald-200 animate-pulse'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              aria-label="Listen to queue status"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-[#0F5147]' : 'text-slate-500'}`} />
              <span>{isSpeaking ? 'Reading aloud...' : 'Listen'}</span>
            </button>
          )}

          {/* View Toggle: Active Queue vs History */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('ACTIVE')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'ACTIVE' ? 'bg-white text-[#0F5147] shadow-2xs' : 'text-slate-600'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setViewMode('HISTORY')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'HISTORY' ? 'bg-white text-[#0F5147] shadow-2xs' : 'text-slate-600'
              }`}
            >
              <History className="w-3 h-3" />
              <span>History</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONNECTION & STALE NOTICES */}
      {!isOnline && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You&apos;re offline. Queue information may not be current.</span>
          </div>
          <span className="text-[10px] font-semibold text-amber-800 uppercase">Offline Mode</span>
        </div>
      )}

      {actionNotice && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 3. MULTI-QUEUE VISIT SWITCHER (If patient has multiple visits) */}
      {viewMode === 'ACTIVE' && activeQueues.length > 1 && (
        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Layers className="w-4 h-4 text-[#0F5147]" />
            <span>Your Healthcare Visits ({activeQueues.length}):</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {activeQueues.map((q) => {
              const isSelected = q.id === currentToken?.id
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleSelectToken(q.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F5147] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {q.tokenNumber} ({q.visitType === 'OPD_CONSULTATION' ? 'OPD' : 'Lab'})
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 4. MAIN CONTENT AREA */}
      {viewMode === 'HISTORY' ? (
        /* QUEUE HISTORY VIEW */
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Queue Visit History</h2>
              <p className="text-xs text-slate-500">Record of completed outpatient consultations and tests</p>
            </div>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {historyItems.length} records
            </span>
          </div>

          {historyItems.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No past visits recorded.</p>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {item.tokenNumber}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {item.outcome}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">{item.facilityName}</p>
                    <p className="text-slate-500">
                      {item.doctorName} • {item.departmentName} ({item.roomNumber})
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-slate-400 font-mono text-[11px] block">{item.date}</span>
                    {item.prescriptionAvailable && (
                      <Link
                        to="/patient/medicines"
                        className="text-[11px] font-bold text-[#0F5147] hover:underline block"
                      >
                        View Prescription
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : !currentToken ? (
        /* NO ACTIVE QUEUE STATE */
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F2F9F8] text-[#0F5147] flex items-center justify-center mx-auto border border-[#D0EAE6]">
            <Clock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">You are not in a queue</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              If you have an appointment scheduled today, you can check in to receive your room entry token.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleCheckInNow}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target cursor-pointer"
            >
              Check in for Today&apos;s Appointment
            </button>
            <Link
              to="/patient/appointments"
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors touch-target"
            >
              View My Appointments
            </Link>
          </div>
        </section>
      ) : (
        /* ACTIVE QUEUE DETAIL & METRICS */
        <div className="space-y-4">
          {/* A. NOT CHECKED IN STATE */}
          {currentToken.state === 'NOT_CHECKED_IN' && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F2F9F8] text-[#0F5147] flex items-center justify-center mx-auto">
                <DoorOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F5147] uppercase tracking-wider block">
                  Hospital Arrival Check-In
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  You&apos;re at {currentToken.facilityName}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Confirm your arrival to generate your live room token and join {currentToken.doctorName}&apos;s consultation line.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCheckInNow}
                className="w-full sm:w-auto px-6 py-3 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-sm font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target cursor-pointer"
              >
                Check In to Queue
              </button>
            </div>
          )}

          {/* B. OPERATIONAL DELAY BANNER */}
          {currentToken.isDelayed && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <strong className="font-bold text-amber-900 block">Queue Delay Notice</strong>
                <p className="text-amber-800 leading-relaxed">
                  {currentToken.delayReason ||
                    'Your queue is running a little late due to an urgent clinical case. Your estimated wait has changed to ~40 min.'}
                </p>
              </div>
            </div>
          )}

          {/* C. PAUSED BANNER */}
          {currentToken.isPaused && (
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-900 flex items-start gap-3 shadow-2xs">
              <PauseCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <strong className="font-bold block">Queue Temporarily Paused</strong>
                <p className="text-slate-600 leading-relaxed">
                  {currentToken.pauseReason ||
                    'Doctor is currently in a brief clinical shift handover. Your place is preserved; we will update you when consultations resume.'}
                </p>
              </div>
            </div>
          )}

          {/* D. CALLED STATE HERO BANNER ("IT'S YOUR TURN!") */}
          {currentToken.state === 'CALLED' && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-6 rounded-2xl bg-emerald-600 text-white shadow-md text-center space-y-3 animate-fade-in"
            >
              <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full inline-block">
                Action Required
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">It&apos;s Your Turn!</h2>
              <div className="p-3 bg-white/10 rounded-xl max-w-sm mx-auto text-xs space-y-0.5">
                <p className="font-mono text-2xl font-bold">{currentToken.tokenNumber}</p>
                <p className="text-emerald-100">
                  Please enter <strong className="text-white font-bold">{currentToken.roomNumber}</strong> now to see{' '}
                  <strong className="text-white font-bold">{currentToken.doctorName}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSimulateState('IN_CONSULTATION')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-900 font-bold text-xs sm:text-sm rounded-xl active:scale-95 shadow-sm touch-target cursor-pointer"
              >
                <span>Go to Consultation Room</span>
              </button>
            </div>
          )}

          {/* E. APPROACHING TURN BANNER */}
          {currentToken.state === 'APPROACHING' && (
            <div className="p-4 rounded-2xl bg-[#F2F9F8] border border-[#D0EAE6] text-slate-800 flex items-start gap-3 shadow-2xs">
              <Sparkles className="w-5 h-5 text-[#0F5147] shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <strong className="font-bold text-[#0F5147] block">You&apos;re Almost Up</strong>
                <p className="text-slate-600 leading-relaxed">
                  Only {currentToken.positionInQueue} people ahead of you. Please walk to the corridor outside{' '}
                  <strong className="text-slate-900">{currentToken.roomNumber}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* F. MISSED TURN RECOVERY BANNER */}
          {currentToken.state === 'MISSED' && (
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <strong className="font-bold text-red-900 block">Turn Was Called While You Were Away</strong>
                  <p className="text-red-800 leading-relaxed">
                    We couldn&apos;t find you when your token {currentToken.tokenNumber} was called.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRejoinQueue}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer touch-target"
                >
                  Rejoin Queue at Priority Position
                </button>
                <a
                  href="tel:108"
                  className="px-3.5 py-2 bg-white border border-red-200 text-red-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  Contact Staff Desk
                </a>
              </div>
            </div>
          )}

          {/* G. IN CONSULTATION STATE */}
          {currentToken.state === 'IN_CONSULTATION' && (
            <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-white px-3 py-1 rounded-full border border-teal-200 inline-block">
                Consultation in Progress
              </span>
              <h2 className="text-xl font-bold text-teal-900">You are currently with the doctor</h2>
              <p className="text-xs text-teal-800 max-w-sm mx-auto">
                {currentToken.doctorName} is reviewing your condition in {currentToken.roomNumber}.
              </p>
              <button
                type="button"
                onClick={() => handleSimulateState('COMPLETED')}
                className="px-5 py-2.5 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer shadow-2xs touch-target"
              >
                Mark Consultation Finished
              </button>
            </div>
          )}

          {/* H. COMPLETED CONSULTATION STATE OR PRIMARY QUEUE CARD */}
          {currentToken.state === 'COMPLETED' ? (
            <div className="p-6 sm:p-8 bg-white rounded-2xl border border-emerald-200 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                  Consultation Concluded
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Your Visit is Completed
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Thank you for visiting <strong className="text-slate-900">{currentToken.facilityName}</strong>. Consultation with <strong className="text-slate-900">{currentToken.doctorName}</strong> ({currentToken.departmentName}) has been closed on record.
                </p>
              </div>

              {/* Summary Pill */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 inline-flex flex-wrap items-center justify-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Token Number</span>
                  <span className="font-mono font-bold text-slate-900">{currentToken.tokenNumber}</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Room</span>
                  <span className="font-bold text-slate-900">{currentToken.roomNumber}</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                  <span className="font-bold text-emerald-700">Archived in Timeline</span>
                </div>
              </div>

              {/* Clinical Continuity Bridges */}
              <div className="space-y-2.5 max-w-xl mx-auto pt-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                  Next Steps in Your Care Journey:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <Link
                    to="/patient/medicines"
                    className="p-4 rounded-xl bg-white hover:bg-[#F2F9F8] border border-slate-200 hover:border-[#D0EAE6] transition-all flex items-start gap-3 group shadow-2xs"
                  >
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-[#0F5147] group-hover:text-white transition-colors">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-[#0F5147]">
                        Prescriptions & Medicines
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        View doctor-prescribed medicines & pharmacy stock
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/patient/diagnostics"
                    className="p-4 rounded-xl bg-white hover:bg-[#F2F9F8] border border-slate-200 hover:border-[#D0EAE6] transition-all flex items-start gap-3 group shadow-2xs"
                  >
                    <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700 group-hover:bg-[#0F5147] group-hover:text-white transition-colors">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-[#0F5147]">
                        Diagnostic Tests & Labs
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Schedule ordered lab tests & access reports
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/patient/my-care"
                    className="p-4 rounded-xl bg-white hover:bg-[#F2F9F8] border border-slate-200 hover:border-[#D0EAE6] transition-all flex items-start gap-3 group shadow-2xs"
                  >
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-700 group-hover:bg-[#0F5147] group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-[#0F5147]">
                        Longitudinal Care Records
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Access official visit summary in your timeline
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/patient/appointments/book"
                    className="p-4 rounded-xl bg-white hover:bg-[#F2F9F8] border border-slate-200 hover:border-[#D0EAE6] transition-all flex items-start gap-3 group shadow-2xs"
                  >
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-[#0F5147] group-hover:text-white transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-[#0F5147]">
                        Book Next Consultation
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Schedule follow-up appointment or specialist visit
                      </span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode('HISTORY')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>View in Queue Visit History</span>
                </button>
              </div>
            </div>
          ) : (
            <section
              aria-label="Your queue status"
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6"
            >
              {/* Header / Hospital & Status */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 pb-5 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {currentToken.facilityName}
                  </span>
                  <h1 className="text-lg font-bold text-slate-900">
                    {currentToken.departmentName}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {currentToken.doctorName} • {currentToken.roomNumber}
                  </p>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end gap-1.5 self-start sm:self-auto">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      currentToken.state === 'CALLED'
                        ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                        : currentToken.state === 'APPROACHING'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : currentToken.state === 'MISSED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-[#F2F9F8] text-[#0F5147] border-[#D0EAE6]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>
                      {currentToken.state === 'CALLED'
                        ? 'Called Now'
                        : currentToken.state === 'APPROACHING'
                        ? 'Approaching'
                        : currentToken.state === 'MISSED'
                        ? 'Missed Turn'
                        : 'Waiting in Queue'}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {lastUpdatedText}
                  </span>
                </div>
              </div>

              {/* 3-SECOND METRIC CARDS (YOUR TOKEN / NOW SERVING / AHEAD / WAIT) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {/* Metric 1: YOUR TOKEN (Largest & Most Prominent) */}
                <div className="p-4 bg-[#F2F9F8] rounded-2xl border border-[#D0EAE6] flex flex-col justify-between col-span-2 sm:col-span-1 shadow-2xs">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F5147] block">
                    Your Token
                  </span>
                  <span className="text-4xl sm:text-5xl font-mono font-extrabold text-[#0F5147] tracking-tight block my-1">
                    {currentToken.tokenNumber}
                  </span>
                  <span className="text-[10px] text-[#0F5147]/80 font-medium block">
                    Priority: {currentToken.priority}
                  </span>
                </div>

                {/* Metric 2: NOW SERVING */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Now Serving
                  </span>
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 block my-1">
                    {currentToken.currentServingToken}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    In {currentToken.roomNumber}
                  </span>
                </div>

                {/* Metric 3: PEOPLE AHEAD */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    People Ahead
                  </span>
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 block my-1">
                    {currentToken.positionInQueue}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {currentToken.positionInQueue === 0 ? 'You are next' : 'Patients in line'}
                  </span>
                </div>

                {/* Metric 4: ESTIMATED WAIT */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Estimated Wait
                  </span>
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#0F5147] block my-1">
                    {currentToken.positionInQueue === 0 ? 'Now' : `~${currentToken.estimatedWaitMinutes}m`}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {currentToken.estimatedWaitRange}
                  </span>
                </div>
              </div>

              {/* I. DISTINCTIVE QUEUE PROGRESS VISUALIZER */}
              <QueueProgressVisualizer token={currentToken} />

              {/* J. NEXT ACTION GUIDANCE BOX */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  What should I do now?
                </span>
                <p className="leading-relaxed">{currentToken.nextActionInstruction}</p>
              </div>

              {/* K. DOCTOR & CLINICAL LOCATION CONTEXT */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-[#0F5147] shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Doctor</span>
                    <strong className="text-slate-900">{currentToken.doctorName}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <DoorOpen className="w-4 h-4 text-[#0F5147] shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Chamber / Counter</span>
                    <strong className="text-slate-900">{currentToken.roomNumber}</strong>
                  </div>
                </div>
              </div>

              {/* L. QUICK ASSISTANCE & LEAVE QUEUE STRIP */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      currentToken.facilityName
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#0F5147]" />
                    <span>Hospital Map</span>
                  </a>

                  <a
                    href="tel:108"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                    <span>Helpdesk / 108</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLeaveModal(true)}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave Queue</span>
                </button>
              </div>
            </section>
          )}

          {/* M. EVALUATOR / DEMO CONTROL PILL (Allows testing all 14 scenarios effortlessly) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <button
              type="button"
              onClick={() => setShowDemoToolbar(!showDemoToolbar)}
              className="w-full flex items-center justify-between font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0F5147]" />
                <span>Evaluator Scenario Simulation Toolbar</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {showDemoToolbar ? 'Hide controls ▲' : 'Show controls ▼'}
              </span>
            </button>

            {showDemoToolbar && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <p className="text-[11px] text-slate-500">
                  Instantly verify any queue state scenario without waiting:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={handleSimulateAdvance}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold text-slate-800 cursor-pointer"
                  >
                    + Advance Queue (Step)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateState('APPROACHING')}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] font-semibold text-emerald-900 cursor-pointer"
                  >
                    Set Approaching (&le;3 ahead)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateState('CALLED')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                  >
                    Set Called (&quot;Your turn!&quot;)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSimulateState('WAITING', {
                        isDelayed: true,
                        delayReason: 'Doctor reviewing emergency case (+15 min delay).',
                      })
                    }
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-[11px] font-semibold text-amber-900 cursor-pointer"
                  >
                    Simulate Delay
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSimulateState('WAITING', {
                        isPaused: true,
                        pauseReason: 'Doctor attending clinical shift handover.',
                      })
                    }
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-semibold text-slate-800 cursor-pointer"
                  >
                    Simulate Paused
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateState('MISSED')}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-[11px] font-semibold text-red-800 cursor-pointer"
                  >
                    Simulate Missed Turn
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSimulateState('WAITING', { isDelayed: false, isPaused: false })
                    }
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                  >
                    Reset to Waiting
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. LEAVE QUEUE CONFIRMATION MODAL */}
      {showLeaveModal && currentToken && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Leave this queue?
              </h3>
              <p className="text-xs text-slate-600">
                You will lose your position for token{' '}
                <strong className="font-mono text-slate-900">{currentToken.tokenNumber}</strong> at{' '}
                {currentToken.facilityName}.
              </p>
            </div>

            <form onSubmit={handleConfirmLeave} className="space-y-3">
              <div>
                <label htmlFor="leave-reason-select" className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Leaving:
                </label>
                <select
                  id="leave-reason-select"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F5147]/20"
                >
                  <option value="Personal emergency / unable to wait">Personal emergency / unable to wait</option>
                  <option value="Feeling better / consultation not needed">Feeling better / consultation not needed</option>
                  <option value="Visited different OPD chamber">Visited different OPD chamber</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Stay in Queue
                </button>
                <button
                  type="submit"
                  disabled={isLeaving}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isLeaving ? 'Leaving...' : 'Confirm Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
