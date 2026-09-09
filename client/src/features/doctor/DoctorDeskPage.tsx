import React, { useState } from 'react'
import {
  Stethoscope,
  AlertOctagon,
  Bell,
  FileText,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface QueuePatient {
  tokenNumber: string
  name: string
  age: number
  gender: string
  complaint: string
  acuity: 'EMERGENCY' | 'PRIORITY' | 'ROUTINE'
  waitTimeMinutes: number
  isCalled?: boolean
}

export const DoctorDeskPage: React.FC = () => {
  const [patients] = useState<QueuePatient[]>([
    {
      tokenNumber: 'B-031',
      name: 'Rameshwar Singh',
      age: 62,
      gender: 'M',
      complaint: 'Acute substernal chest pressure radiating to left arm (MEWS: 4)',
      acuity: 'EMERGENCY',
      waitTimeMinutes: 12,
      isCalled: true,
    },
    {
      tokenNumber: 'B-032',
      name: 'Priyanka Devi',
      age: 28,
      gender: 'F',
      complaint: 'High fever with rigors for 4 days, suspected malaria/dengue',
      acuity: 'PRIORITY',
      waitTimeMinutes: 24,
    },
    {
      tokenNumber: 'B-033',
      name: 'Anil Kumar',
      age: 45,
      gender: 'M',
      complaint: 'Routine follow-up for Type-2 Diabetes & hypertension refill',
      acuity: 'ROUTINE',
      waitTimeMinutes: 35,
    },
  ])

  const [activePatient, setActivePatient] = useState<QueuePatient>(patients[0])

  const handleCallNext = () => {
    alert(`Calling patient ${activePatient.name} (Token #${activePatient.tokenNumber}) to Chamber 14! Audio bell broadcasted to waiting area.`)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Clinician Desk Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dr. Rajesh Verma (MBBS, MD)</h1>
            <p className="text-xs text-slate-500">
              General Medicine OPD &bull; Chamber 14 &bull; Pandeypur District Hospital
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">32 Patients Served Today</Badge>
          <Button
            variant="primary"
            size="md"
            onClick={handleCallNext}
            leftIcon={<Bell className="w-4 h-4" />}
          >
            Call Next Patient (#{activePatient.tokenNumber})
          </Button>
        </div>
      </div>

      {/* Main 2-Column Split Console: Queue List on Left, Active Patient Workspace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dynamic Waiting Queue */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Waiting Queue ({patients.length} Waiting)
          </h2>

          <div className="space-y-2">
            {patients.map((p) => {
              const isSelected = p.tokenNumber === activePatient.tokenNumber
              return (
                <div
                  key={p.tokenNumber}
                  onClick={() => setActivePatient(p)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-50/70 border-cyan-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-mono font-bold text-cyan-800">
                      #{p.tokenNumber}
                    </span>
                    <Badge
                      variant={
                        p.acuity === 'EMERGENCY'
                          ? 'destructive'
                          : p.acuity === 'PRIORITY'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {p.acuity}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {p.name} ({p.age}/{p.gender})
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.complaint}</p>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Waiting: ~{p.waitTimeMinutes} mins
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Active Consultation Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-700">
                  TOKEN #{activePatient.tokenNumber} &bull; ACTIVE CONSULTATION
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {activePatient.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Age: {activePatient.age} &bull; Gender: {activePatient.gender} &bull; ABHA ID: 91-4820-2918-4210
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Launching digital referral form for ${activePatient.name}`)}
                  leftIcon={<Share2 className="w-3.5 h-3.5" />}
                >
                  Initiate Referral
                </Button>
              </div>
            </div>

            {/* Presenting Chief Complaint */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <strong className="text-slate-900 block font-semibold">Chief Complaint & Vitals:</strong>
              <p className="text-slate-700">{activePatient.complaint}</p>
            </div>

            {/* Assistive AI Differential Box (Clinical Safety Compliant) */}
            <div className="p-4 bg-yellow-50/60 border border-yellow-300/80 rounded-xl text-xs text-yellow-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-yellow-900">
                <AlertOctagon className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span>AI Clinical Differential Assistant (Assistive Only &bull; Human Verification Required)</span>
              </div>
              <p className="text-slate-700">
                Symptoms indicate high probability of <strong>Acute Coronary Syndrome (STEMI / NSTEMI)</strong>.
                Recommended immediate actions: 12-lead ECG, Troponin I assay, sublingual Sorbitrate, dual antiplatelet loading.
              </p>
              <label className="flex items-center gap-2 pt-1 font-semibold text-slate-800 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-cyan-600 rounded" />
                <span>I have clinically verified this evaluation and order immediate 12-Lead ECG</span>
              </label>
            </div>

            {/* Prescription & Order Buttons */}
            <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 justify-end">
              <Button
                variant="outline"
                size="md"
                onClick={() => alert('Order Lab Diagnostics')}
              >
                Order Lab Tests (FHIR)
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => alert(`Prescription generated and sent to patient locker and hospital pharmacy!`)}
                leftIcon={<FileText className="w-4 h-4" />}
              >
                Sign & Finalize Prescription
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
