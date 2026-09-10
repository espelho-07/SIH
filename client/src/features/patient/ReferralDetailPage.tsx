import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Printer,
  MapPin,
  Clock,
  Phone,
  BedDouble,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Stethoscope,
  Sparkles,
  Info,
  Truck,
} from 'lucide-react'
import { referralService } from '@/services/referralService'
import { ReferralStatusBadge } from '@/components/healthcare/ReferralStatusBadge'
import { ReferralTimeline } from '@/components/healthcare/ReferralTimeline'
import { ReferralFacilityMatcher } from '@/components/healthcare/ReferralFacilityMatcher'
import { GovernmentHealthcareBadge } from '@/components/healthcare/GovernmentHealthcareBadge'
import type { ReferralClinicalSummary, ReceivingFacilityMatch } from '@/types/referral'

export const ReferralDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const [referral, setReferral] = useState<ReferralClinicalSummary | null>(null)
  const [matchingFacilities, setMatchingFacilities] = useState<ReceivingFacilityMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessingAction, setIsProcessingAction] = useState(false)
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  // Checklist state
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let isMounted = true
    if (!id) return

    referralService
      .getReferralById(id)
      .then(async (data) => {
        if (isMounted && data) {
          setReferral(data)
          const matches = await referralService.getMatchingReceivingFacilities(data.id)
          if (isMounted) {
            setMatchingFacilities(matches)
            setIsLoading(false)
          }
        } else if (isMounted) {
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const handleSelectFacility = async (facilityId: string) => {
    if (!referral) return
    setIsProcessingAction(true)
    try {
      if (referral.status === 'FALLBACK_REROUTING') {
        const updated = await referralService.switchFallbackFacility(referral.id, facilityId)
        setReferral(updated)
        setActionNotice(`Successfully transferred and locked bed at ${updated.receivingFacilityName}!`)
      } else {
        const updated = await referralService.acceptReceivingFacility(referral.id, facilityId)
        setReferral(updated)
        setActionNotice(`Receiving facility confirmed! Bed locked at ${updated.receivingFacilityName}.`)
      }
      setTimeout(() => setActionNotice(null), 5000)
    } finally {
      setIsProcessingAction(false)
    }
  }

  const handleRequestTransit = async (type: 'AMBULANCE_108' | 'SELF_TRANSPORT') => {
    if (!referral) return
    setIsProcessingAction(true)
    try {
      const updated = await referralService.requestTransit(referral.id, type)
      setReferral(updated)
      setActionNotice(
        type === 'AMBULANCE_108'
          ? 'Emergency 108 Ambulance dispatch confirmed! Driver is en route.'
          : 'Transit commenced. Present your referral code upon arrival.'
      )
      setTimeout(() => setActionNotice(null), 5000)
    } finally {
      setIsProcessingAction(false)
    }
  }

  const handleConfirmArrival = async () => {
    if (!referral) return
    setIsProcessingAction(true)
    try {
      const updated = await referralService.confirmArrival(referral.id)
      setReferral(updated)
      setActionNotice('Arrival confirmed! Your referral handshake is completed at receiving reception.')
      setTimeout(() => setActionNotice(null), 5000)
    } finally {
      setIsProcessingAction(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const toggleDoc = (doc: string) => {
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }))
  }

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="p-8 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
        </div>
      </main>
    )
  }

  if (!referral) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Referral Record Not Found</h2>
        <p className="text-xs text-slate-500">
          The referral code could not be resolved or may have been archived.
        </p>
        <Link
          to="/patient/referrals"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5147] text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Referrals</span>
        </Link>
      </main>
    )
  }

  const isUrgent = referral.urgency === 'URGENT' || referral.urgency === 'CRITICAL_TRAUMA'
  const isAccepted = [
    'ACCEPTED_BED_LOCKED',
    'APPOINTMENT_BOOKED',
    'IN_TRANSIT',
    'PATIENT_ARRIVED',
    'IN_TREATMENT',
    'COMPLETED',
  ].includes(referral.status)

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar: Back, Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/patient/referrals"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#0F5147] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Referral Trail</span>
        </Link>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer touch-target"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print OPD Slip</span>
          </button>

          <a
            href="tel:108"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors touch-target"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>108 Emergency</span>
          </a>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Dossier Header */}
      <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-black text-[#0F5147] bg-[#F2F9F8] px-3 py-1 rounded-lg border border-[#D0EAE6]">
                {referral.referralCode}
              </span>
              <GovernmentHealthcareBadge ownership="GOVERNMENT" tier={referral.referringFacilityTier} />
              {isUrgent && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {referral.urgency === 'CRITICAL_TRAUMA' ? 'Critical Emergency SLA' : 'Urgent Referral (4hr SLA)'}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {referral.requiredSpecialty}
            </h1>
            <p className="text-xs text-slate-500">
              Patient: <strong>{referral.patientName}</strong> ({referral.patientAge}y, {referral.patientGender}) • ABHA: {referral.abhaId || 'Verified'}
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-start sm:items-end justify-between gap-2">
            <ReferralStatusBadge status={referral.status} />
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              SLA Window: Active
            </span>
          </div>
        </div>

        {/* 1. WHY WAS I REFERRED? (Crucial User Requirement) */}
        <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Info className="w-4 h-4 text-[#0F5147]" />
            <span>Why You Were Referred</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {referral.plainLanguageExplanation}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Provisional Diagnosis:</span>
            <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
              {referral.clinicalReason}
            </span>
          </div>
        </div>

        {/* Required Treatments & Diagnostics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Required Specialized Treatments
            </span>
            <ul className="space-y-1">
              {referral.requiredTreatments.map((t, idx) => (
                <li key={idx} className="text-xs text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Diagnostic Procedures Required
            </span>
            <ul className="space-y-1">
              {referral.requiredDiagnostics.map((d, idx) => (
                <li key={idx} className="text-xs text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5147] shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 2. CLOSED-LOOP TIMELINE */}
      <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Closed-Loop Care Continuity Tracker
            </h2>
            <p className="text-xs text-slate-500">
              Live progression from referring clinic to receiving hospital bed and final consultation feedback.
            </p>
          </div>
          <span className="text-xs font-bold text-[#0F5147] bg-[#F2F9F8] px-2.5 py-1 rounded-full border border-[#D0EAE6]">
            Real-time Audit
          </span>
        </div>

        <ReferralTimeline referral={referral} />
      </section>

      {/* 3. RECEIVING FACILITY SELECTION OR CONFIRMED DESTINATION */}
      {isAccepted && referral.receivingFacilityName ? (
        <section className="p-6 bg-white rounded-2xl border border-[#D0EAE6] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Confirmed Destination Facility
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {referral.receivingFacilityName}
              </h2>
            </div>
            <GovernmentHealthcareBadge ownership="GOVERNMENT" tier={referral.receivingFacilityTier || 'DISTRICT_HOSPITAL'} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Address</span>
              <p className="text-slate-700 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0F5147] shrink-0 mt-0.5" />
                <span>{referral.receivingFacilityAddress}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Consulting Clinician</span>
              <p className="text-slate-700 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-[#0F5147]" />
                <span>{referral.receivingDoctorName || 'Duty Specialist'} ({referral.receivingDoctorSpecialty || referral.requiredSpecialty})</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Bed Reservation</span>
              <p className="text-emerald-800 font-bold flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5 text-emerald-600" />
                <span>Locked for 45 Minutes (#ICU-04)</span>
              </p>
            </div>
          </div>

          {/* Quick Action Strip for Confirmed Destination */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            {/* 1-click Book Appointment */}
            <Link
              to={`/patient/appointments/book?facilityId=${referral.receivingFacilityId}&referralId=${referral.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0F5147] hover:bg-[#0B3D35] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target"
            >
              <Calendar className="w-4 h-4" />
              <span>Book OPD Appointment Slot</span>
            </Link>

            {/* View Queue Token if assigned */}
            {referral.linkedQueueToken && (
              <Link
                to={`/patient/queue?token=${referral.linkedQueueToken}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition-colors touch-target"
              >
                <Clock className="w-4 h-4" />
                <span>View Inbound Token ({referral.linkedQueueToken})</span>
              </Link>
            )}

            {/* Transit or Check-in Action */}
            {referral.status === 'ACCEPTED_BED_LOCKED' && (
              <>
                <button
                  type="button"
                  onClick={() => handleRequestTransit('AMBULANCE_108')}
                  disabled={isProcessingAction}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold rounded-xl border border-red-200 transition-colors touch-target cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-red-600" />
                  <span>Request 108 Ambulance Transit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRequestTransit('SELF_TRANSPORT')}
                  disabled={isProcessingAction}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors touch-target cursor-pointer"
                >
                  <span>Travelling by Own Vehicle</span>
                </button>
              </>
            )}

            {/* Arrival Confirmation Action */}
            {referral.status === 'IN_TRANSIT' && (
              <button
                type="button"
                onClick={handleConfirmArrival}
                disabled={isProcessingAction}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-2xs touch-target cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Arrival at Reception Desk</span>
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <ReferralFacilityMatcher
            matches={matchingFacilities}
            selectedFacilityId={referral.receivingFacilityId}
            onSelectFacility={handleSelectFacility}
            isSelecting={isProcessingAction}
            isFallbackMode={referral.status === 'FALLBACK_REROUTING'}
          />
        </section>
      )}

      {/* 4. PRE-ARRIVAL PHYSICAL DOCUMENTS CHECKLIST */}
      <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Pre-Arrival Physical Checklist
            </h3>
            <p className="text-xs text-slate-500">
              Check off documents to ensure swift cashless admission at the destination reception.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {Object.values(checkedDocs).filter(Boolean).length} of {referral.requiredDocuments.length} Ready
          </span>
        </div>

        <div className="space-y-2.5">
          {referral.requiredDocuments.map((doc, idx) => {
            const isChecked = Boolean(checkedDocs[doc])
            return (
              <label
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleDoc(doc)}
                  className="mt-0.5 w-4 h-4 rounded text-[#0F5147] focus:ring-[#0F5147] border-slate-300"
                />
                <span className={`text-xs ${isChecked ? 'font-bold' : 'font-medium'}`}>
                  {doc}
                </span>
              </label>
            )
          })}
        </div>
      </section>

      {/* 5. CONSULTATION OUTCOME RECEIPT (If Completed) */}
      {referral.outcomeReceipt && (
        <section className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Closed-Loop Outcome Summary
              </span>
              <h3 className="text-base font-bold text-emerald-950">
                Final Clinical Outcome & PHC Feedback
              </h3>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>

          <div className="space-y-2 text-xs text-emerald-900">
            <p>
              <strong>Closing Diagnosis: </strong>
              {referral.outcomeReceipt.closingDiagnosis}
            </p>
            <p>
              <strong>Consultation Summary: </strong>
              {referral.outcomeReceipt.consultationSummary}
            </p>
            <div>
              <strong className="block mb-1">Prescribed Next Steps:</strong>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                {referral.outcomeReceipt.prescriptionsIssued.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="pt-2 text-[11px] text-emerald-700 font-medium">
              ✓ Electronic outcome receipt has been transmitted back to {referral.referringFacilityName} for medical record continuity.
            </div>
          </div>
        </section>
      )}

      {/* 6. AI BOUNDARY & CLINICAL GOVERNANCE DISCLAIMER */}
      <footer className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-[#0F5147]" />
          <span>AI Assistance & Medical Authority Governance</span>
        </div>
        <p>
          HealthConnect&apos;s facility matching engine assists patients and clinicians by aggregating real-time bed capacity, equipment operational telemetry, and geographic reach. All clinical transfer decisions, treatment protocols, and diagnostic evaluations remain strictly the prerogative of authorized medical practitioners.
        </p>
      </footer>
    </main>
  )
}
