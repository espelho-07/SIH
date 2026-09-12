import React from 'react';
import { PriorityLevel } from '@/types/queue';
import {
  Printer,
  HeartPulse,
  CheckCircle2,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export interface LiveHospitalCaseSheetProps {
  hospitalName: string;
  district: string;
  clerkName?: string;
  name: string;
  phone: string;
  gender: 'M' | 'F' | 'Other';
  age: string;
  dob?: string;
  abhaId?: string;
  abhaVerified?: boolean;
  address?: string;
  pincode?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  departmentId: string;
  priority: PriorityLevel;
  currentStep: number;
}

const DEPARTMENTS: Record<string, { name: string; room: string; doctor: string; code: string }> = {
  dep_med: { name: 'General Medicine OPD', room: 'Room 4', doctor: 'Dr. Arvind Patel', code: 'MED' },
  dep_cardio: { name: 'Cardiology Clinic', room: 'Room 6', doctor: 'Dr. Arvind Patel', code: 'CARD' },
  dep_ortho: { name: 'Orthopedics Clinic', room: 'Room 8', doctor: 'Dr. Rajesh Mehta', code: 'ORTH' },
  dep_peds: { name: 'Pediatrics & Immunization', room: 'Room 2', doctor: 'Dr. Sneha Desai', code: 'PEDS' },
  dep_gyn: { name: 'Gynecology & ANC', room: 'Room 5', doctor: 'Dr. Bhavna Joshi', code: 'GYN' },
};

export const LiveHospitalCaseSheet: React.FC<LiveHospitalCaseSheetProps> = ({
  hospitalName,
  district,
  clerkName = 'Counter 02 • Registration Staff',
  name,
  phone,
  gender,
  age,
  dob,
  abhaId,
  abhaVerified,
  address,
  pincode = '382010',
  emergencyName,
  emergencyPhone,
  emergencyRelation = 'Attendant',
  departmentId,
  priority,
}) => {
  const dept = DEPARTMENTS[departmentId] || DEPARTMENTS.dep_med;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const crNumber = `CR-${now.getFullYear()}-${phone && phone.length >= 4 ? phone.slice(-4) : '7891'}`;
  const tokenPreview = `T-${dept.code}-${phone && phone.length >= 2 ? phone.slice(-2) : '14'}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3">
      {/* Action Strip Above Case Sheet */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-teal-700" />
            Live Hospital Case Sheet (केस पेपर)
          </span>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
          title="Print OPD Case Slip"
        >
          <Printer className="h-3.5 w-3.5 text-teal-700" />
          <span>Print Slip (प्रिंट)</span>
        </button>
      </div>

      {/* PHYSICAL CASE PAPER CONTAINER */}
      <div className="relative rounded-2xl border-2 border-slate-300 bg-white shadow-xl overflow-hidden font-sans text-slate-900 transition-all">
        {/* Subtle Watermark in background */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.025] select-none">
          <HeartPulse className="w-80 h-80 text-slate-900" />
        </div>

        {/* 1. Official Government & Hospital Masthead */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 text-white p-4 text-center border-b-2 border-amber-400 relative">
          <div className="flex items-center justify-between gap-2 mb-1 text-[10px] font-semibold text-teal-200">
            <span>GOVERNMENT OF GUJARAT</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE REAL-TIME PREVIEW
            </span>
            <span>DEPT OF HEALTH & FAMILY WELFARE</span>
          </div>

          <h3 className="font-black text-sm sm:text-base tracking-tight uppercase text-white drop-shadow-xs">
            {hospitalName || 'Gandhinagar Civil Hospital & Medical College'}
          </h3>
          <p className="text-[11px] text-teal-100 font-medium">
            District Public Health Grid • {district || 'Gandhinagar'}, Gujarat
          </p>

          <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] font-bold">
            <span className="text-amber-300 tracking-wider uppercase">
              OPD PATIENT REGISTRATION CASE PAPER
            </span>
            <span className="text-teal-200 font-mono text-[10px]">
              FORM: HCON-OPD-V3
            </span>
          </div>
        </div>

        {/* 2. Registration Metadata Strip */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">CR NUMBER:</span>
            <strong className="text-slate-900 font-bold">{crNumber}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">REG DATE & TIME:</span>
            <strong className="text-slate-800">{dateStr} {timeStr}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">REGISTRATION FEE:</span>
            <strong className="text-emerald-700">₹ 10.00 (Govt Paid)</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">CLERK COUNTER:</span>
            <strong className="text-slate-800 truncate block">{clerkName}</strong>
          </div>
        </div>

        {/* 3. Patient Demographics Particulars (Fills in Real Time) */}
        <div className="p-4 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
            {/* Row 1: Patient Name */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 pb-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Patient Full Name (मरीज का नाम):
                </span>
                <div className="mt-0.5">
                  {name.trim() ? (
                    <span className="text-base font-black text-teal-950 uppercase tracking-tight block">
                      {name.trim()}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic font-mono">
                      [Fill patient name in form...]
                    </span>
                  )}
                </div>
              </div>

              {/* ABHA Badge */}
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">ABHA Account:</span>
                {abhaId ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-mono text-xs font-bold text-slate-800">{abhaId}</span>
                    {abhaVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                        <CheckCircle2 className="h-2.5 w-2.5" /> VERIFIED
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Not Linked</span>
                )}
              </div>
            </div>

            {/* Row 2: Age, Gender, Mobile */}
            <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-b border-slate-200/80 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Age / Gender:</span>
                <span className="font-bold text-slate-900">
                  {age ? `${age} Yrs` : '__ Yrs'} / {gender === 'M' ? 'Male (पु)' : gender === 'F' ? 'Female (स्त्री)' : 'Other'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone Number:</span>
                <span className="font-mono font-bold text-slate-900">
                  {phone ? `+91 ${phone}` : '+91 __________'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Date of Birth:</span>
                <span className="font-mono text-slate-800">
                  {dob || '—'}
                </span>
              </div>
            </div>

            {/* Row 3: Address & Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Residential Address:</span>
                <span className="text-slate-800 font-medium line-clamp-1">
                  {address && address.trim() ? `${address.trim()}, ${district} - ${pincode}` : `${district} - ${pincode}`}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Emergency Attendant:</span>
                <span className="text-slate-800 font-medium">
                  {emergencyName ? `${emergencyName} (${emergencyRelation}) • +91 ${emergencyPhone || '—'}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. OPD Clinic & Live Token Block */}
          <div className="rounded-xl border-2 border-teal-600/30 bg-teal-50/50 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-teal-800 block">
                  Target Clinic & Consultation Room:
                </span>
                <h4 className="text-sm font-black text-teal-950">
                  {dept.name}
                </h4>
                <p className="text-xs text-teal-800 font-medium">
                  {dept.room} • Attending: <strong className="font-bold">{dept.doctor}</strong>
                </p>
              </div>

              {/* Live Token Number Preview Box */}
              <div className="text-center rounded-xl bg-white border-2 border-teal-700 p-2.5 shadow-sm shrink-0 min-w-[100px]">
                <span className="text-[9px] uppercase font-extrabold text-teal-700 block tracking-wider">
                  OPD TOKEN
                </span>
                <div className="text-xl font-black font-mono text-teal-950 tracking-tight my-0.5">
                  {tokenPreview}
                </div>
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider bg-teal-100 text-teal-800">
                  {priority}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Doctor Clinical Notes & Examination (Authentic Ruled Case Paper Section) */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                CLINICAL VITALS & EXAMINATION (चिकित्सक तपासणी)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ROOM NURSE / TRIAGE ENTRY
              </span>
            </div>

            {/* Vitals Baseline Bar */}
            <div className="grid grid-cols-5 gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-[10px]">
              <div>
                <span className="text-slate-400 block">BP (mmHg)</span>
                <strong className="text-slate-700 font-mono text-xs">___ / ___</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Pulse (bpm)</span>
                <strong className="text-slate-700 font-mono text-xs">___</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Temp (°F)</span>
                <strong className="text-slate-700 font-mono text-xs">___</strong>
              </div>
              <div>
                <span className="text-slate-400 block">SpO2 (%)</span>
                <strong className="text-slate-700 font-mono text-xs">___ %</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Weight (kg)</span>
                <strong className="text-slate-700 font-mono text-xs">___ kg</strong>
              </div>
            </div>

            {/* Doctor Ruled Writing Section */}
            <div className="space-y-2 text-xs pt-1">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-600 block">
                  Chief Complaints (C/O) & Clinical History:
                </span>
                <div className="border-b border-dotted border-slate-300 h-4 mt-1" />
                <div className="border-b border-dotted border-slate-300 h-4 mt-1" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-600 block">
                  Rx - Treatment / Medications Advised (औषधे):
                </span>
                <div className="flex items-start gap-2 pt-1">
                  <span className="text-base font-serif font-black text-slate-800 leading-none">℞</span>
                  <div className="flex-1 space-y-2">
                    <div className="border-b border-dotted border-slate-300 h-4" />
                    <div className="border-b border-dotted border-slate-300 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stamp & Sign Strip */}
            <div className="pt-3 flex items-end justify-between text-[10px] border-t border-slate-100">
              <div className="space-y-1">
                {/* Simulated Barcode */}
                <div className="flex items-center gap-0.5 h-6">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1].map((w, i) => (
                    <div
                      key={i}
                      className="bg-slate-800 h-full"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-slate-500 block">
                  *{crNumber}*
                </span>
              </div>

              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1" />
                <span className="font-bold text-slate-600 block text-[9px] uppercase">
                  Doctor's Sign & Stamp
                </span>
                <span className="text-[8px] text-slate-400">
                  {hospitalName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Footer Disclaimer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-[10px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-teal-700" />
            <span>Valid for 7 days across all public healthcare OPDs.</span>
          </div>
          <span className="font-mono text-[9px] text-slate-400">
            SECURE ABDM VERIFIED
          </span>
        </div>
      </div>
    </div>
  );
};
