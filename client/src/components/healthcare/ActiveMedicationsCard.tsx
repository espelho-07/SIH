import React from 'react'
import { Link } from 'react-router-dom'
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import type { PrescriptionItem } from '@/types/record'

export interface ActiveMedicationsCardProps {
  medications: PrescriptionItem[]
  className?: string
}

export const ActiveMedicationsCard: React.FC<ActiveMedicationsCardProps> = ({
  medications,
  className = '',
}) => {
  const activeOnly = medications.filter((m) => m.isActive)

  return (
    <div
      id="medications"
      className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
            <Pill className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Active Digital Prescriptions & Medications
            </h3>
            <p className="text-xs text-slate-500">
              Prescribed by authorized government doctors • Jan Aushadhi generic coverage
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            {activeOnly.length} Active Medicines
          </span>

          <Link
            to="/patient/medicines"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <span>Jan Aushadhi Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Medication List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeOnly.map((med) => (
          <div
            key={med.id}
            className="flex flex-col justify-between p-4 rounded-xl bg-amber-50/30 border border-amber-200/80 space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {med.medicineName}
                </h4>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  {med.dosage}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-0.5">
                Generic: {med.genericName}
              </p>

              {/* Schedule timing pill */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-amber-900">
                <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span>{med.frequency}</span>
              </div>

              {/* Patient instruction note */}
              <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-white/60 p-2 rounded-lg border border-amber-100">
                {med.instructions}
              </p>
            </div>

            <div className="pt-2 border-t border-amber-200/60 text-xs text-slate-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Course: {med.durationDays} days</span>
                {med.refillsRemaining !== undefined && (
                  <span className="font-medium text-emerald-600">
                    {med.refillsRemaining} refills left
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Rx by {med.prescribedBy}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clinical Medication Safety Banner */}
      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
        <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-semibold text-slate-900">
            Medication Safety & Refill Instructions:{' '}
          </span>
          Take medicines strictly at prescribed times with food or water as directed. Never self-adjust dosage. Pradhan Mantri Jan Aushadhi Kendras provide certified bioequivalent generic formulations under zero-billing Ayushman entitlement.
        </div>
      </div>
    </div>
  )
}
