import React from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Calendar,
  Clock,
  Share2,
  Activity,
  Pill,
  Droplet,
  PhoneCall,
  ArrowRight,
  ExternalLink,
  RotateCcw,
} from 'lucide-react'
import type { AssistantStructuredData, AssistantProposedAction } from '@/types/assistant'

interface AssistantActionCardProps {
  data?: AssistantStructuredData
  proposedAction?: AssistantProposedAction
  onActionClick?: (action: AssistantProposedAction) => void
}

export const AssistantActionCard: React.FC<AssistantActionCardProps> = ({
  data,
  proposedAction,
  onActionClick,
}) => {
  if (!data && !proposedAction) return null

  return (
    <div className="space-y-3 pt-1 w-full max-w-lg">
      {/* 1. Facilities preview */}
      {data?.facilities && data.facilities.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Verified Public Healthcare Facilities ({data.facilities.length})
          </div>
          {data.facilities.map((fac) => (
            <div
              key={fac.id}
              className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-[#0F5147]/50 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#F2F9F8] border border-[#D0EAE6] flex items-center justify-center text-[#0F5147] shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {fac.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {fac.district} • {fac.tier}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                      {fac.generalBeds.available} General Beds
                    </span>
                    {fac.icuBeds.available > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                        {fac.icuBeds.available} ICU Beds
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                to={`/patient/facility/${fac.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold shrink-0 active:scale-95 transition-all"
              >
                <span>View</span>
                <ChevronRightSmall />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 2. Active Queue Token preview */}
      {data?.queueToken && (
        <div className="p-3.5 bg-white rounded-xl border border-[#D0EAE6] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0F5147]" />
              <span className="text-xs font-bold text-slate-900">Live OPD Queue Position</span>
            </div>
            <span className="font-mono text-xs font-extrabold text-[#0F5147] bg-[#F2F9F8] px-2 py-0.5 rounded border border-[#D0EAE6]">
              {data.queueToken.tokenNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div>
              <span className="text-slate-500 block">Now Serving:</span>
              <span className="font-bold text-slate-900 font-mono">
                {data.queueToken.currentServingToken}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Ahead of You:</span>
              <span className="font-bold text-slate-900">
                {data.queueToken.positionInQueue} (~{data.queueToken.estimatedWaitMinutes}m)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600">
            {data.queueToken.facilityName} • Room {data.queueToken.roomNumber} ({data.queueToken.doctorName})
          </p>
        </div>
      )}

      {/* 3. Appointment preview */}
      {data?.appointment && (
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0F5147]" />
              <span className="text-xs font-bold text-slate-900">Confirmed Appointment</span>
            </div>
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {data.appointment.referenceNumber}
            </span>
          </div>

          <div className="text-xs space-y-0.5">
            <p className="font-bold text-slate-900">{data.appointment.doctorName}</p>
            <p className="text-slate-500 text-[11px]">
              {data.appointment.facilityName} • {data.appointment.departmentName}
            </p>
            <p className="text-slate-700 font-medium text-[11px] pt-1">
              🗓️ {data.appointment.date} at {data.appointment.timeSlot}
            </p>
          </div>
        </div>
      )}

      {/* 4. Referral preview */}
      {data?.referral && (
        <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-slate-900">Hospital Transfer Referral</span>
            </div>
            <span className="font-mono text-xs font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
              {data.referral.referralCode}
            </span>
          </div>

          <div className="text-xs space-y-1">
            <p className="font-semibold text-slate-800">
              Specialty: <span className="font-bold text-slate-900">{data.referral.requiredSpecialty}</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Receiving: {data.referral.receivingFacilityName || 'Reviewing Tertiary Facilities'}
            </p>
            <p className="text-[11px] text-amber-800 font-medium bg-amber-50 p-1.5 rounded border border-amber-200/60">
              Next Action: {data.referral.nextActionInstruction}
            </p>
          </div>
        </div>
      )}

      {/* 5. Diagnostic orders preview */}
      {data?.diagnosticOrders && data.diagnosticOrders.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Prescribed Diagnostics ({data.diagnosticOrders.length})
          </div>
          {data.diagnosticOrders.map((test) => (
            <div
              key={test.id}
              className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <Activity className="w-4 h-4 text-[#0F5147] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-slate-900">{test.testName}</h5>
                  <p className="text-[11px] text-slate-500">
                    {test.orderingFacilityName} • Status: <span className="font-semibold text-slate-700">{test.status}</span>
                  </p>
                </div>
              </div>
              <Link
                to={`/patient/diagnostics/${test.id}`}
                className="text-[11px] text-[#0F5147] font-semibold hover:underline shrink-0"
              >
                Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 6. Active Medications preview */}
      {data?.medications && data.medications.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Active Medications ({data.medications.length})
          </div>
          {data.medications.slice(0, 3).map((med, idx) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <Pill className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-slate-900">{med.medicineName}</h5>
                  <p className="text-[11px] text-slate-500">
                    {med.strength} • {med.schedule.label} ({med.durationDays} days)
                  </p>
                </div>
              </div>
              {med.isGenericAvailable && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Jan Aushadhi
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 7. Blood Stock preview */}
      {data?.bloodStock && data.bloodStock.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Verified Blood Bank Units
          </div>
          {data.bloodStock.map((b) => (
            <div
              key={b.id}
              className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">{b.bloodGroup}</span>
                  <span className="text-slate-500 text-[11px] ml-1.5">({b.component})</span>
                  <p className="text-[10px] text-slate-500">{b.facilityName}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-xs">
                  {b.unitsAvailable} Units
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 8. Follow-up preview */}
      {data?.followUps && data.followUps.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Ongoing Care Follow-up
          </div>
          {data.followUps.slice(0, 1).map((fu) => (
            <div
              key={fu.id}
              className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[#0F5147]" />
                  <span className="font-bold text-slate-900">{fu.specialty} Follow-Up</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {fu.status}
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                {fu.doctorName} • {fu.facilityName}
              </p>
              <p className="text-[#0F5147] font-semibold text-[11px]">
                Target Date: {fu.recommendedDateIso}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 9. Primary Proposed Action Card / Button */}
      {proposedAction && (
        <div className="p-3.5 bg-[#F2F9F8] rounded-xl border border-[#D0EAE6] flex items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900">
              {proposedAction.title}
            </h4>
            <p className="text-[11px] text-slate-600">
              {proposedAction.description}
            </p>
          </div>

          {proposedAction.requiresConfirmation ? (
            <button
              type="button"
              onClick={() => onActionClick?.(proposedAction)}
              className="px-3.5 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer active:scale-95 transition-all shadow-2xs touch-target"
            >
              Confirm Action
            </button>
          ) : proposedAction.destinationUrl?.startsWith('tel:') ? (
            <a
              href={proposedAction.destinationUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer active:scale-95 transition-all shadow-2xs touch-target"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Now</span>
            </a>
          ) : (
            <Link
              to={proposedAction.destinationUrl || '/patient/home'}
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#0F5147] hover:bg-[#0B3D35] text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer active:scale-95 transition-all shadow-2xs touch-target"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function ChevronRightSmall() {
  return <ExternalLink className="w-3 h-3 text-slate-500" aria-hidden="true" />
}
