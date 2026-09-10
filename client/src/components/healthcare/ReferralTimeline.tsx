import React from 'react'
import {
  FileText,
  Send,
  BedDouble,
  Calendar,
  Truck,
  Building2,
  Stethoscope,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react'
import type { ReferralClinicalSummary } from '@/types/referral'

export interface ReferralTimelineProps {
  referral: ReferralClinicalSummary
  className?: string
}

export const ReferralTimeline: React.FC<ReferralTimelineProps> = ({ referral, className = '' }) => {
  const isRejected = referral.status === 'REJECTED'
  const isFallback = referral.status === 'FALLBACK_REROUTING'

  // Canonical 8 stages of the closed-loop healthcare referral
  const stages = [
    {
      key: 'INITIATED',
      title: 'Referral Initiated',
      actor: referral.referringFacilityName,
      icon: FileText,
      active: true,
      done: true,
      time: referral.createdAtIso,
    },
    {
      key: 'DISPATCHED',
      title: 'Receiving Facility Notified',
      actor: 'HealthConnect Referral Engine',
      icon: Send,
      active: true,
      done: referral.status !== 'SUBMITTED',
      time: referral.events.find((e) => e.status === 'PENDING_CONFIRMATION')?.timestampIso,
    },
    {
      key: 'ACCEPTED',
      title: 'Facility Accepted & Bed Locked',
      actor: referral.receivingFacilityName || 'Specialty Desk',
      icon: BedDouble,
      active: [
        'ACCEPTED_BED_LOCKED',
        'APPOINTMENT_BOOKED',
        'IN_TRANSIT',
        'PATIENT_ARRIVED',
        'IN_TREATMENT',
        'COMPLETED',
      ].includes(referral.status),
      done: [
        'APPOINTMENT_BOOKED',
        'IN_TRANSIT',
        'PATIENT_ARRIVED',
        'IN_TREATMENT',
        'COMPLETED',
      ].includes(referral.status),
      time: referral.events.find((e) => e.status === 'ACCEPTED_BED_LOCKED')?.timestampIso,
    },
    {
      key: 'APPOINTMENT',
      title: 'OPD Slot / Queue Token Linked',
      actor: referral.linkedQueueToken ? `Token ${referral.linkedQueueToken}` : 'OPD Reception',
      icon: Calendar,
      active: [
        'APPOINTMENT_BOOKED',
        'IN_TRANSIT',
        'PATIENT_ARRIVED',
        'IN_TREATMENT',
        'COMPLETED',
      ].includes(referral.status) || Boolean(referral.linkedAppointmentId),
      done: [
        'IN_TRANSIT',
        'PATIENT_ARRIVED',
        'IN_TREATMENT',
        'COMPLETED',
      ].includes(referral.status),
      time: referral.linkedAppointmentTime,
    },
    {
      key: 'TRANSIT',
      title: 'Patient In Transit',
      actor: referral.ambulanceDispatched ? '108 Ambulance BLS' : 'Self-Transit',
      icon: Truck,
      active: [
        'IN_TRANSIT',
        'PATIENT_ARRIVED',
        'IN_TREATMENT',
        'COMPLETED',
      ].includes(referral.status),
      done: [
        'PATIENT_ARRIVED',
        'IN_TREATMENT',
        'COMPLETED',
      ].includes(referral.status),
      time: referral.events.find((e) => e.status === 'IN_TRANSIT')?.timestampIso,
    },
    {
      key: 'ARRIVED',
      title: 'Reception Arrival Confirmed',
      actor: 'Receiving Desk Check-in',
      icon: Building2,
      active: ['PATIENT_ARRIVED', 'IN_TREATMENT', 'COMPLETED'].includes(referral.status),
      done: ['IN_TREATMENT', 'COMPLETED'].includes(referral.status),
      time: referral.arrivedAtIso,
    },
    {
      key: 'CONSULTATION',
      title: 'Specialist Consultation',
      actor: referral.receivingDoctorName || referral.requiredSpecialty,
      icon: Stethoscope,
      active: ['IN_TREATMENT', 'COMPLETED'].includes(referral.status),
      done: referral.status === 'COMPLETED',
      time: referral.consultationStartedAtIso,
    },
    {
      key: 'CLOSED',
      title: 'Closed & Feedback Transmitted',
      actor: `Originating PHC: ${referral.referringFacilityName}`,
      icon: CheckCircle2,
      active: referral.status === 'COMPLETED',
      done: referral.status === 'COMPLETED',
      time: referral.completedAtIso,
    },
  ]

  return (
    <div className={`space-y-4 ${className}`} aria-label="Closed-loop care continuity timeline">
      {/* Rejected Alert if applicable */}
      {isRejected && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900">
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">
              Receiving Facility Capacity Exhausted
            </h4>
            <p className="text-xs text-red-700">
              {referral.rejectionReason || 'The selected hospital reported full bed or specialist capacity.'}
            </p>
            <p className="text-[11px] font-semibold text-red-600">
              HealthConnect has rerouted you to verified alternative facilities below.
            </p>
          </div>
        </div>
      )}

      {/* Fallback Rerouting Alert if applicable */}
      {isFallback && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
          <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Action Required: Confirm Verified Alternative Facility
            </h4>
            <p className="text-xs text-amber-700">
              Sir Sunderlal Hospital trauma ward is currently full. Review the recommended alternative facility below and confirm to lock your bed.
            </p>
          </div>
        </div>
      )}

      {/* Timeline Steps */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {stages.map((stage) => {
          const Icon = stage.icon
          const isCurrent = stage.active && !stage.done
          const isDone = stage.done

          return (
            <div key={stage.key} className="relative flex items-start gap-3.5 group">
              {/* Node Circle */}
              <div
                className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : isCurrent
                    ? 'bg-[#0F5147] text-white ring-4 ring-[#D0EAE6] animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
                aria-hidden="true"
              >
                <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </div>

              {/* Stage Details */}
              <div className="flex-1 space-y-0.5 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4
                    className={`text-xs font-bold leading-tight ${
                      isDone
                        ? 'text-slate-900'
                        : isCurrent
                        ? 'text-[#0F5147]'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.title}
                  </h4>
                  {stage.time && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {stage.time.includes('Today') ? stage.time : new Date(stage.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 truncate">
                  {stage.actor}
                </p>

                {isCurrent && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2F9F8] text-[#0F5147] text-[10px] font-extrabold uppercase tracking-wide border border-[#D0EAE6]">
                      Active Stage • {referral.nextActionInstruction}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
