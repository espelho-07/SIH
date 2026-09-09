import React from 'react'
import { cn } from '@/lib/utils'
import { Check, Clock, AlertOctagon, Truck, Hospital, CheckCircle2 } from 'lucide-react'
import type { ReferralStatus } from '@/types/referral'

export interface ReferralStatusStepperProps {
  status: ReferralStatus
  className?: string
}

export const ReferralStatusStepper: React.FC<ReferralStatusStepperProps> = ({ status, className }) => {
  const steps = [
    { key: 'SUBMITTED', label: 'Submitted', icon: Clock },
    { key: 'ACCEPTED_BED_LOCKED', label: 'Bed Locked', icon: Check },
    { key: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
    { key: 'PATIENT_ARRIVED', label: 'Arrived', icon: Hospital },
    { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
  ]

  const statusOrder: Record<string, number> = {
    SUBMITTED: 0,
    PENDING_CONFIRMATION: 0,
    ACCEPTED_BED_LOCKED: 1,
    IN_TRANSIT: 2,
    PATIENT_ARRIVED: 3,
    IN_TREATMENT: 3,
    COMPLETED: 4,
  }

  const isRejected = status === 'REJECTED'
  const isCancelled = status === 'CANCELLED'
  const currentStepIndex = isRejected || isCancelled ? -1 : statusOrder[status] ?? 0

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm font-medium">
        <AlertOctagon className="w-5 h-5 text-red-600" aria-hidden="true" />
        Referral Rejected by Receiving Facility — Fallback Facility Routing Recommended
      </div>
    )
  }

  return (
    <div className={cn('w-full py-2', className)}>
      <ol className="flex items-center w-full justify-between relative" aria-label="Referral progress">
        {steps.map((step, index) => {
          const isComplete = index <= currentStepIndex
          const isCurrent = index === currentStepIndex
          const Icon = step.icon

          return (
            <li key={step.key} className="flex flex-col items-center flex-1 relative z-10">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                  isComplete
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 border border-slate-300',
                  isCurrent && 'ring-4 ring-emerald-100'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </div>
              <span
                className={cn(
                  'text-xs font-semibold mt-1.5 text-center',
                  isComplete ? 'text-emerald-800' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </li>
          )
        })}
        {/* Connecting bar */}
        <div
          className="absolute top-4.5 left-8 right-8 h-0.5 bg-slate-200 -z-0"
          aria-hidden="true"
        />
      </ol>
    </div>
  )
}
