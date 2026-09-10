import React from 'react'
import { CheckCircle2, Clock, Calendar, FileText, Stethoscope } from 'lucide-react'
import type { FollowUpStatus } from '@/types/followUp'

export interface FollowUpTimelineVisualizerProps {
  status: FollowUpStatus
  hasPrerequisiteDiagnostics?: boolean
  scheduledDate?: string
  completedDate?: string
}

export const FollowUpTimelineVisualizer: React.FC<FollowUpTimelineVisualizerProps> = ({
  status,
  hasPrerequisiteDiagnostics = false,
  scheduledDate,
  completedDate,
}) => {
  const steps = [
    {
      id: 'step-1',
      title: 'Initial Care Encounter',
      subtitle: 'Consultation / referral complete',
      isCompleted: true,
      icon: <Stethoscope className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'step-2',
      title: 'Follow-Up Recommended',
      subtitle: 'Clinical interval set by doctor',
      isCompleted: true,
      icon: <Clock className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'step-3',
      title: 'Prerequisite Reports',
      subtitle: hasPrerequisiteDiagnostics ? 'Diagnostic tests ready' : 'Standard pre-visit checklist',
      isCompleted: status !== 'RECOMMENDED',
      icon: <FileText className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'step-4',
      title: 'Follow-Up Appointment',
      subtitle: scheduledDate ? `Booked for ${scheduledDate}` : status === 'MISSED' ? 'Window passed — re-book slot' : 'Book OPD consultation slot',
      isCompleted: status === 'SCHEDULED' || status === 'COMPLETED',
      isCurrent: status === 'DUE' || status === 'MISSED',
      icon: <Calendar className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'step-5',
      title: 'Clinical Review & Outcome',
      subtitle: completedDate ? `Completed on ${new Date(completedDate).toLocaleDateString()}` : 'Continued care or episode closure',
      isCompleted: status === 'COMPLETED',
      icon: <CheckCircle2 className="w-4 h-4" aria-hidden="true" />,
    },
  ]

  return (
    <nav aria-label="Care Continuity Stages" className="w-full py-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative">
        {steps.map((step, idx) => {
          const isDone = step.isCompleted
          const isCur = step.isCurrent

          return (
            <div
              key={step.id}
              className="flex-1 flex items-start sm:items-center gap-3 relative w-full sm:w-auto"
            >
              {/* Connector line for desktop */}
              {idx < steps.length - 1 && (
                <div
                  className={`hidden sm:block absolute top-4 left-7 right-0 h-0.5 -z-0 ${
                    isDone ? 'bg-[#0F5147]' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Node Circle */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                  isDone
                    ? 'bg-[#0F5147] text-white border-[#0F5147]'
                    : isCur
                      ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-100'
                      : 'bg-white text-slate-400 border-slate-300'
                }`}
              >
                {step.icon}
              </div>

              {/* Step Labels */}
              <div className="space-y-0.5 pr-2">
                <span
                  className={`text-xs font-bold block leading-tight ${
                    isDone ? 'text-slate-900' : isCur ? 'text-amber-900' : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  {step.subtitle}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
