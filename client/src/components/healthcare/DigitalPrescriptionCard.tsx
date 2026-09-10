import React from 'react'
import {
  Pill,
  Sun,
  Moon,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  Printer,
  Search,
  CheckCircle2,
} from 'lucide-react'
import type { DigitalPrescription, MedicineItem } from '@/types/prescription'

export interface DigitalPrescriptionCardProps {
  prescription: DigitalPrescription
  onSearchMedicine?: (genericName: string) => void
  className?: string
}

export const DigitalPrescriptionCard: React.FC<DigitalPrescriptionCardProps> = ({
  prescription,
  onSearchMedicine,
  className = '',
}) => {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
              {prescription.prescriptionCode}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {new Date(prescription.prescribedAtIso).toLocaleDateString()}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Clinical Prescription & Medication Order
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Diagnosis: <span className="font-semibold text-slate-800 dark:text-slate-200">{prescription.diagnosisDescription}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Print Rx Slip</span>
        </button>
      </div>

      {/* Facility & Doctor Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{prescription.facilityName}</span>
          <span className="text-slate-400">({prescription.departmentName})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Prescribed by: <strong className="text-slate-900 dark:text-white">{prescription.prescribingDoctorName}</strong> ({prescription.doctorRegistrationNumber})</span>
        </div>
      </div>

      {/* Prescribed Medicines List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Prescribed Medications ({prescription.medicines.length})
        </h4>

        <div className="space-y-3">
          {prescription.medicines.map((med: MedicineItem) => (
            <div
              key={med.id}
              className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 space-y-2.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
                    <Pill className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h5 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {med.medicineName}
                    </h5>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Generic: {med.genericName} • Strength: {med.strength}
                    </span>
                  </div>
                </div>

                {/* Schedule timing icons */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                  <span>{med.schedule.label}</span>
                </div>
              </div>

              {/* Schedule detail pill indicators */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${med.schedule.morning > 0 ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                  <Sun className="w-3 h-3" aria-hidden="true" />
                  Morning: {med.schedule.morning}
                </span>

                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${med.schedule.afternoon > 0 ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                  <Sun className="w-3 h-3" aria-hidden="true" />
                  Noon: {med.schedule.afternoon}
                </span>

                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${med.schedule.night > 0 ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                  <Moon className="w-3 h-3" aria-hidden="true" />
                  Night: {med.schedule.night}
                </span>

                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-400">Duration: {med.durationDays} days</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{med.refillsRemaining} refills left</span>
              </div>

              {/* Instructions */}
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white">Doctor Instructions: </span>
                {med.instructions}
              </p>

              {/* Quick Stock Search Action */}
              {onSearchMedicine && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Pradhan Mantri Jan Aushadhi generic coverage available
                  </span>

                  <button
                    type="button"
                    onClick={() => onSearchMedicine(med.genericName)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white underline cursor-pointer"
                  >
                    <Search className="w-3 h-3" aria-hidden="true" />
                    <span>Check Public Stock</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pharmacy Dispensation Record */}
      {prescription.isDispensed && (
        <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs flex flex-wrap items-center justify-between gap-2 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <div>
              <span className="font-bold block">Dispensed: {prescription.dispensingPharmacyName}</span>
              <span className="text-slate-600 dark:text-slate-400">{prescription.dispensationNotes}</span>
            </div>
          </div>
          <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300">
            Zero-Billing PM-JAY Verified
          </span>
        </div>
      )}
    </div>
  )
}
