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
      className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900">
              {prescription.prescriptionCode}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {new Date(prescription.prescribedAtIso).toLocaleDateString()}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Clinical Prescription & Medication Order
          </h3>

          <p className="text-xs text-slate-600 mt-0.5">
            Diagnosis: <span className="font-semibold text-slate-800">{prescription.diagnosisDescription}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Print Rx Slip</span>
        </button>
      </div>

      {/* Facility & Doctor Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <span className="font-semibold text-slate-800">{prescription.facilityName}</span>
          <span className="text-slate-400">({prescription.departmentName})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Prescribed by: <strong className="text-slate-900">{prescription.prescribingDoctorName}</strong> ({prescription.doctorRegistrationNumber})</span>
        </div>
      </div>

      {/* Prescribed Medicines List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Prescribed Medications ({prescription.medicines.length})
        </h4>

        <div className="space-y-3">
          {prescription.medicines.map((med: MedicineItem) => (
            <div
              key={med.id}
              className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 space-y-2.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    <Pill className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h5 className="text-sm sm:text-base font-bold text-slate-900">
                      {med.medicineName}
                    </h5>
                    <span className="text-xs text-slate-500">
                      Generic: {med.genericName} • Strength: {med.strength}
                    </span>
                  </div>
                </div>

                {/* Schedule timing icons */}
                <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold text-amber-900">
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
                <span className="text-slate-600">Duration: {med.durationDays} days</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-700 font-semibold">{med.refillsRemaining} refills left</span>
              </div>

              {/* Instructions */}
              <p className="text-xs text-slate-700 bg-white/70 p-2.5 rounded-lg border border-amber-100 leading-relaxed">
                <span className="font-semibold text-slate-900">Doctor Instructions: </span>
                {med.instructions}
              </p>

              {/* Quick Stock Search Action */}
              {onSearchMedicine && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">
                    Pradhan Mantri Jan Aushadhi generic coverage available
                  </span>

                  <button
                    type="button"
                    onClick={() => onSearchMedicine(med.genericName)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
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
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2 text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <div>
              <span className="font-bold block">Dispensed: {prescription.dispensingPharmacyName}</span>
              <span className="text-slate-600">{prescription.dispensationNotes}</span>
            </div>
          </div>
          <span className="font-mono text-[11px] text-emerald-800">
            Zero-Billing PM-JAY Verified
          </span>
        </div>
      )}
    </div>
  )
}
