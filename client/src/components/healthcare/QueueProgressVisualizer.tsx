import React from 'react'
import { DoorOpen, User, Check, AlertCircle } from 'lucide-react'
import type { ActiveToken } from '@/types/queue'

export interface QueueProgressVisualizerProps {
  token: ActiveToken
  className?: string
}

export const QueueProgressVisualizer: React.FC<QueueProgressVisualizerProps> = ({
  token,
  className = '',
}) => {
  const isCalled = token.state === 'CALLED'
  const isApproaching = token.state === 'APPROACHING'
  const isInConsultation = token.state === 'IN_CONSULTATION'
  const isCompleted = token.state === 'COMPLETED'
  const isMissed = token.state === 'MISSED'

  return (
    <div
      className={`p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 ${className}`}
      aria-label="Queue journey visualizer"
    >
      {/* Top Status Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
          Corridor Progression
        </span>
        <span className="font-semibold text-[#0F5147]">
          {isCalled
            ? "It's your turn now"
            : isInConsultation
            ? 'In consultation'
            : isCompleted
            ? 'Consultation finished'
            : isMissed
            ? 'Turn called earlier'
            : isApproaching
            ? `${token.positionInQueue} people ahead — move to door`
            : `${token.positionInQueue} people ahead of you`}
        </span>
      </div>

      {/* Distinctive Milestone Journey Track */}
      <div className="relative pt-2 pb-1">
        {/* Track Line */}
        <div className="absolute left-6 right-6 top-6 h-1 bg-slate-200 rounded-full" aria-hidden="true" />

        <div className="relative flex items-center justify-between">
          {/* Milestone 1: Doctor's Consultation Chamber */}
          <div className="flex flex-col items-center text-center space-y-1.5 z-10">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                isCalled || isInConsultation
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                  : 'bg-white border-2 border-slate-300 text-slate-700 shadow-2xs'
              }`}
            >
              <DoorOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {token.roomNumber.replace('Room ', 'Room ')}
              </span>
              <span className="text-[10px] text-slate-500 block">Doctor&apos;s Room</span>
            </div>
          </div>

          {/* Milestone 2: Now Serving (In Room or Entering) */}
          <div className="flex flex-col items-center text-center space-y-1.5 z-10">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-bold text-xs transition-all ${
                isCalled
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-white border-2 border-slate-300 text-slate-900 shadow-2xs'
              }`}
            >
              {isCompleted ? (
                <Check className="w-5 h-5 text-emerald-700" />
              ) : (
                token.currentServingToken
              )}
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                Now Serving
              </span>
              <span className="text-[10px] text-slate-500 block">
                {isCalled ? 'Calling You' : 'In Room'}
              </span>
            </div>
          </div>

          {/* Milestone 3: Queue Depth / People Ahead Indicator */}
          {!isCalled && !isInConsultation && !isCompleted && (
            <div className="hidden sm:flex flex-col items-center text-center space-y-1 z-10 px-2">
              <div className="flex items-center gap-1.5 py-2.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400">
                {token.positionInQueue} in line
              </span>
            </div>
          )}

          {/* Milestone 4: Your Token Position */}
          <div className="flex flex-col items-center text-center space-y-1.5 z-10">
            <div
              className={`w-12 h-12 rounded-2xl font-mono font-extrabold text-sm flex items-center justify-center transition-all ${
                isCalled
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 animate-pulse shadow-md'
                  : isApproaching
                  ? 'bg-[#0F5147] text-white ring-4 ring-[#D0EAE6] shadow-sm'
                  : isMissed
                  ? 'bg-red-50 text-red-700 border-2 border-red-300'
                  : 'bg-[#0F5147] text-white shadow-2xs ring-2 ring-white'
              }`}
            >
              {isMissed ? (
                <AlertCircle className="w-6 h-6 text-red-600" />
              ) : (
                token.tokenNumber
              )}
            </div>
            <div className="space-y-0.5">
              <span
                className={`text-xs font-extrabold block leading-tight ${
                  isCalled ? 'text-emerald-800' : 'text-[#0F5147]'
                }`}
              >
                Your Token
              </span>
              <span className="text-[10px] text-slate-500 block">
                {isCalled
                  ? 'Turn Arrived!'
                  : isApproaching
                  ? 'Almost Next'
                  : `Slot #${token.positionInQueue}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Visual Explanation Footer */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <User className="w-4 h-4 text-[#0F5147] shrink-0" aria-hidden="true" />
        <p className="leading-tight">
          <strong className="text-slate-900 font-semibold">{token.doctorName}</strong> is consulting{' '}
          <strong className="font-mono text-slate-900">{token.currentServingToken}</strong> in{' '}
          <strong className="text-slate-900">{token.roomNumber}</strong>.
          {token.positionInQueue > 0 && (
            <span> There are {token.positionInQueue} patients remaining before token {token.tokenNumber}.</span>
          )}
        </p>
      </div>
    </div>
  )
}
