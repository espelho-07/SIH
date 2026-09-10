import React from 'react'
import { CheckCircle2, Circle, Clock, Activity, Sparkles } from 'lucide-react'
import type { DiagnosticOrderStatus } from '@/types/diagnostic'

export interface DiagnosticProgressStepperProps {
  status: DiagnosticOrderStatus
  className?: string
}

interface Step {
  key: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const STEPS: Step[] = [
  {
    key: 'ORDERED',
    label: 'Test Ordered',
    description: 'Requisition authored by clinician',
    icon: Circle,
  },
  {
    key: 'COLLECTION_SCHEDULED',
    label: 'Collection Scheduled',
    description: 'Facility & time window assigned',
    icon: Clock,
  },
  {
    key: 'SAMPLE_COLLECTED',
    label: 'Sample Collected',
    description: 'Specimen barcoded by phlebotomist',
    icon: CheckCircle2,
  },
  {
    key: 'PROCESSING',
    label: 'Lab Processing',
    description: 'Analyzer investigation underway',
    icon: Activity,
  },
  {
    key: 'REPORT_READY',
    label: 'Report Ready',
    description: 'Digitally sealed by pathologist',
    icon: Sparkles,
  },
]

export const DiagnosticProgressStepper: React.FC<DiagnosticProgressStepperProps> = ({
  status,
  className = '',
}) => {
  const getActiveStepIndex = (st: DiagnosticOrderStatus): number => {
    switch (st) {
      case 'ORDERED':
      case 'APPOINTMENT_NEEDED':
        return 0
      case 'SAMPLE_COLLECTION_PENDING':
        return 1
      case 'SAMPLE_COLLECTED':
        return 2
      case 'PROCESSING':
        return 3
      case 'REPORT_READY':
      case 'REVIEWED':
        return 4
      case 'CANCELLED':
        return -1
      default:
        return 0
    }
  }

  const activeIndex = getActiveStepIndex(status)

  if (status === 'CANCELLED') {
    return (
      <div className={`p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 text-center ${className}`}>
        This diagnostic order was cancelled by the attending clinician.
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Desktop / Tablet Horizontal Stepper */}
      <div className="hidden sm:grid grid-cols-5 gap-2 relative">
        {/* Continuous connector line */}
        <div
          className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"
          aria-hidden="true"
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex
          const isCurrent = idx === activeIndex
          const Icon = isCompleted ? CheckCircle2 : step.icon

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isCurrent
                      ? 'bg-white dark:bg-slate-900 border-emerald-600 text-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </div>

              <span
                className={`mt-2 text-xs font-bold ${
                  isCurrent
                    ? 'text-emerald-800 dark:text-emerald-300'
                    : isCompleted
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.label}
              </span>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[110px] mt-0.5 leading-tight">
                {step.description}
              </span>
            </div>
          )
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="sm:hidden space-y-3">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex
          const isCurrent = idx === activeIndex
          const Icon = isCompleted ? CheckCircle2 : step.icon

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border shrink-0 mt-0.5 ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isCurrent
                      ? 'bg-white dark:bg-slate-900 border-emerald-600 text-emerald-600 ring-2 ring-emerald-200'
                      : 'bg-white dark:bg-slate-900 border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <div className="text-xs">
                <span
                  className={`font-bold block ${
                    isCurrent
                      ? 'text-emerald-800 dark:text-emerald-300'
                      : isCompleted
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-slate-500 text-[11px]">{step.description}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
