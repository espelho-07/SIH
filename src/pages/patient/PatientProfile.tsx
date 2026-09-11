import React, { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { AddFamilyMemberModal } from '@/components/patient/AddFamilyMemberModal';
import { AssignPhoneModal } from '@/components/patient/AssignPhoneModal';
import { FamilyMember } from '@/types/family';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users,
  ShieldCheck,
  Smartphone,
  FileText,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Download,
  Share2,
  Calendar,
  Activity,
  Heart,
  Droplet,
  ChevronRight,
  Pill,
  Clock,
  Sparkles,
  ArrowRight,
  Lock,
  Trash2,
  Check,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  Building2,
  PhoneCall,
  UserCheck,
} from 'lucide-react';

interface MockFamilyRecord {
  id: string;
  memberId: string;
  memberName: string;
  relation: string;
  type: 'PRESCRIPTION' | 'LAB_REPORT' | 'OPD_VISIT' | 'VACCINATION';
  title: string;
  facility: string;
  doctor: string;
  date: string;
  summary: string;
  status: 'VERIFIED' | 'COMPLETED' | 'ACTIVE';
  documentUrl?: string;
}

const MOCK_FAMILY_RECORDS: MockFamilyRecord[] = [
  {
    id: 'rec-01',
    memberId: 'mem_03',
    memberName: 'Gopal Sharma',
    relation: 'Father (Elderly)',
    type: 'OPD_VISIT',
    title: 'Cardiology Follow-up & ECG',
    facility: 'Gandhinagar District Hospital',
    doctor: 'Dr. Vikramaditya Mehta (MD Card)',
    date: '10 Sep 2026',
    summary: 'Hypertension stable on Telmisartan 40mg. Mild bradycardia noted; advised salt restriction and walking.',
    status: 'COMPLETED',
  },
  {
    id: 'rec-02',
    memberId: 'mem_03',
    memberName: 'Gopal Sharma',
    relation: 'Father (Elderly)',
    type: 'PRESCRIPTION',
    title: 'Hypertension & Lipid Regimen',
    facility: 'Gandhinagar District Hospital',
    doctor: 'Dr. Vikramaditya Mehta',
    date: '10 Sep 2026',
    summary: 'Rx: Tab Telmisartan 40mg OD, Tab Atorvastatin 10mg HS for 90 days.',
    status: 'ACTIVE',
  },
  {
    id: 'rec-03',
    memberId: 'mem_02',
    memberName: 'Savitri Sharma',
    relation: 'Spouse',
    type: 'LAB_REPORT',
    title: 'Complete Blood Count & Thyroid Profile',
    facility: 'Pethapur Primary Health Centre (PHC)',
    doctor: 'Dr. Priya Desai',
    date: '28 Aug 2026',
    summary: 'Hb: 12.4 g/dL (Normal). TSH: 2.8 uIU/mL (Normal). Blood Glucose Fasting: 96 mg/dL.',
    status: 'VERIFIED',
  },
  {
    id: 'rec-04',
    memberId: 'mem_04',
    memberName: 'Pooja Sharma',
    relation: 'Daughter',
    type: 'VACCINATION',
    title: 'National Immunization Td Booster',
    facility: 'Urban Health Centre - Sector 21',
    doctor: 'Sister Meena Solanki (ANM)',
    date: '14 Jul 2026',
    summary: 'Administered Tetanus and adult Diphtheria (Td) booster dose. No adverse reactions observed.',
    status: 'VERIFIED',
  },
  {
    id: 'rec-05',
    memberId: 'mem_01',
    memberName: 'Rameshwar Sharma',
    relation: 'Self',
    type: 'OPD_VISIT',
    title: 'Seasonal Bronchitis & General OPD',
    facility: 'Pethapur Primary Health Centre (PHC)',
    doctor: 'Dr. Ananya Patel (MO)',
    date: '02 Sep 2026',
    summary: 'Dry cough and mild evening fever x 3 days. Chest clear. Advised hydration, steam inhalation, and antihistamines.',
    status: 'COMPLETED',
  },
  {
    id: 'rec-06',
    memberId: 'mem_01',
    memberName: 'Rameshwar Sharma',
    relation: 'Self',
    type: 'PRESCRIPTION',
    title: 'Acute Bronchitis Prescription',
    facility: 'Pethapur Primary Health Centre (PHC)',
    doctor: 'Dr. Ananya Patel',
    date: '02 Sep 2026',
    summary: 'Rx: Tab Levocetirizine 5mg HS x 5 days, Syp Ambroxol 10ml TDS x 5 days.',
    status: 'ACTIVE',
  },
];

export const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  const {
    members,
    activeMember,
    setActiveMemberId,
    removeMember,
  } = useFamily();

  const [activeTab, setActiveTab] = useState<'members' | 'abha' | 'records' | 'settings'>('members');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assigningMember, setAssigningMember] = useState<FamilyMember | null>(null);
  const [selectedAbhaMember, setSelectedAbhaMember] = useState<FamilyMember>(activeMember);
  const [recordFilterMemberId, setRecordFilterMemberId] = useState<string>('ALL');
  const [recordFilterType, setRecordFilterType] = useState<string>('ALL');
  const [showQrFullscreen, setShowQrFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRecords = MOCK_FAMILY_RECORDS.filter((rec) => {
    const matchesMember =
      recordFilterMemberId === 'ALL' || rec.memberId === recordFilterMemberId;
    const matchesType =
      recordFilterType === 'ALL' || rec.type === recordFilterType;
    return matchesMember && matchesType;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ================================================== */}
      {/* HEADER BANNER */}
      {/* ================================================== */}
      <div className="rounded-2xl border border-teal-200/60 bg-gradient-to-r from-teal-900 via-teal-800 to-teal-950 p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-700/80 border border-teal-500/50 px-3 py-1 text-xs font-semibold text-teal-100">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                ABDM Family Health Account
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200">
                Primary Phone: +91 98765 43210
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Family Healthcare & Member Profiles
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl leading-relaxed">
              In India, multiple household members often share a single mobile device. With Sanjeevani Connect, one primary mobile number manages up to 6 family members with individual ABHA Health IDs. When any dependent acquires their own smartphone, easily decouple and assign their dedicated mobile number.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-teal-950/40 rounded-lg px-3 py-1.5 border border-teal-700/40 text-xs">
                <Users className="h-4 w-4 text-teal-300" />
                <span className="text-teal-200 font-medium">Household Size:</span>
                <span className="font-bold text-white">{members.length} Members</span>
              </div>
              <div className="flex items-center gap-2 bg-teal-950/40 rounded-lg px-3 py-1.5 border border-teal-700/40 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-teal-200 font-medium">Active Member:</span>
                <span className="font-bold text-white">{activeMember.name} ({activeMember.relation === 'SELF' ? 'Self' : activeMember.relationLabel})</span>
              </div>
              <div className="flex items-center gap-2 bg-teal-950/40 rounded-lg px-3 py-1.5 border border-teal-700/40 text-xs">
                <Smartphone className="h-4 w-4 text-amber-300" />
                <span className="text-teal-200 font-medium">Decoupled Phones:</span>
                <span className="font-bold text-white">
                  {members.filter((m) => m.hasOwnPhone || m.phoneType === 'PERSONAL').length} Personal
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 rounded-xl py-2.5 px-4 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              + Add Family Member
            </Button>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* NAVIGATION TABS */}
      {/* ================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'members'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Users className="h-4 w-4" />
          Household Members ({members.length})
        </button>

        <button
          onClick={() => {
            setSelectedAbhaMember(activeMember);
            setActiveTab('abha');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'abha'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Digital ABHA Cards
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'records'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <FileText className="h-4 w-4" />
          Family Health Vault ({MOCK_FAMILY_RECORDS.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          Phone & Account Settings
        </button>
      </div>

      {/* ================================================== */}
      {/* TAB 1: MEMBERS DIRECTORY */}
      {/* ================================================== */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Helpful Explanatory Alert */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-800 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                How Shared Family Healthcare Works in India
              </h3>
              <p className="text-xs text-teal-800 leading-relaxed">
                You can switch the active profile at any time to book hospital OPD appointments, request telemedicine consultations, or view clinical lab tests for any family member. When a dependent gets their own mobile phone, click <strong>"Assign Personal Phone"</strong> to decouple their profile while keeping all past health records safe.
              </p>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => {
              const isActive = member.id === activeMember.id;
              const isSelf = member.relation === 'SELF';
              const hasPersonalPhone = member.hasOwnPhone || member.phoneType === 'PERSONAL';
              const memberDisplayPhone = member.personalPhone || (member.phone !== '9876543210' ? member.phone : null);

              return (
                <div
                  key={member.id}
                  className={`rounded-2xl border transition-all p-5 relative overflow-hidden bg-white ${
                    isActive
                      ? 'border-teal-600 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top Bar inside card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar initial */}
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs shrink-0 ${
                          member.gender === 'F'
                            ? 'bg-pink-100 text-pink-700 border border-pink-200'
                            : member.gender === 'M'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-teal-100 text-teal-700 border border-teal-200'
                        }`}
                      >
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                            {member.name}
                          </h3>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 border border-teal-300 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                              <Check className="h-3 w-3" /> Active Now
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                          <span className="font-semibold text-slate-700">
                            {member.relationLabel}
                          </span>
                          <span>•</span>
                          <span>{member.age} yrs ({member.gender === 'F' ? 'Female' : member.gender === 'M' ? 'Male' : 'Other'})</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                            <Droplet className="h-3 w-3" /> {member.bloodGroup}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Relation Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isSelf
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {member.relation}
                    </span>
                  </div>

                  {/* ABHA details */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">
                        ABHA Health ID
                      </span>
                      <span className="font-mono font-bold text-teal-900">
                        {member.abhaId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">
                        ABHA Address
                      </span>
                      <span className="font-mono text-slate-600 text-[11px]">
                        {member.abhaAddress || `${member.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@abdm`}
                      </span>
                    </div>
                  </div>

                  {/* Chronic Conditions Tag */}
                  {member.chronicConditions && member.chronicConditions.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Care Tags:
                      </span>
                      {member.chronicConditions.map((cond, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Phone Linkage Box */}
                  <div className="mt-3 rounded-xl p-3 border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70 border-slate-200">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Smartphone className="h-3.5 w-3.5 text-slate-500" />
                        {hasPersonalPhone && memberDisplayPhone ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            Personal: +91 {memberDisplayPhone}
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                              Decoupled
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-700 font-medium">
                            Shared Mobile (+91 98765 43210)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {hasPersonalPhone && memberDisplayPhone
                          ? 'Independent OTP verification & personal login active'
                          : 'Receives hospital SMS & OTPs on primary household phone'}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAssigningMember(member)}
                      className="text-xs h-7 px-2.5 rounded-lg border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold cursor-pointer shrink-0"
                    >
                      {hasPersonalPhone && memberDisplayPhone ? 'Change Phone' : 'Assign Personal Phone'}
                    </Button>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!isActive ? (
                        <Button
                          type="button"
                          onClick={() => {
                            setActiveMemberId(member.id);
                            showToast(`Switched active profile to ${member.name}`);
                          }}
                          className="text-xs h-8 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                        >
                          Switch to this Profile
                        </Button>
                      ) : (
                        <span className="text-xs font-bold text-teal-700 flex items-center gap-1 px-2 py-1 bg-teal-50 rounded-lg">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Currently Active Profile
                        </span>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAbhaMember(member);
                          setActiveTab('abha');
                        }}
                        className="text-xs h-8 px-2.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <QrCode className="h-3.5 w-3.5 mr-1 text-slate-500" />
                        View ABHA
                      </Button>
                    </div>

                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to remove ${member.name} from this family account? Their ABHA health record will remain intact in ABDM.`
                            )
                          ) {
                            removeMember(member.id);
                            showToast(`Removed ${member.name} from family account`);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick Add Member Card */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-500 p-8 flex flex-col items-center justify-center gap-3 text-center bg-slate-50/50 hover:bg-teal-50/30 transition-all cursor-pointer group"
            >
              <div className="h-12 w-12 rounded-2xl bg-white group-hover:bg-teal-600 group-hover:text-white text-teal-700 border border-slate-200 group-hover:border-teal-600 flex items-center justify-center transition-all shadow-xs">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-900">
                  + Add Another Family Member
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Add children, spouse, or elderly parents under this mobile number. Instant digital ABHA ID will be generated.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* TAB 2: DIGITAL ABHA CARD (ABDM) */}
      {/* ================================================== */}
      {activeTab === 'abha' && (
        <div className="space-y-6">
          {/* Member selector pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Select Member:
            </span>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedAbhaMember(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedAbhaMember.id === m.id
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{m.name}</span>
                <span className="text-[10px] opacity-75">
                  ({m.relation === 'SELF' ? 'Self' : m.relationLabel.split(' ')[0]})
                </span>
              </button>
            ))}
          </div>

          {/* Official Ayushman Bharat Digital Card Display */}
          <div className="max-w-xl mx-auto">
            <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-white via-amber-50/20 to-teal-50/30 p-6 shadow-xl relative overflow-hidden">
              {/* Top Tricolor Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-xs text-center leading-none">
                    🇮🇳<br />NHA
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">
                      National Health Authority
                    </h4>
                    <p className="text-[11px] font-bold text-teal-800">
                      Ayushman Bharat Digital Mission (ABDM)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> VERIFIED CITIZEN
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
                {/* Photo & QR */}
                <div className="flex flex-col items-center justify-center gap-3 text-center sm:border-r sm:border-slate-200 sm:pr-4">
                  <div className="h-24 w-24 rounded-2xl bg-teal-900 text-white flex flex-col items-center justify-center font-bold text-xl shadow-md border-2 border-white">
                    {selectedAbhaMember.name.slice(0, 2).toUpperCase()}
                    <span className="text-[9px] font-normal text-teal-200 tracking-wider">
                      PHOTO
                    </span>
                  </div>

                  {/* QR Code preview */}
                  <div
                    onClick={() => setShowQrFullscreen(true)}
                    className="p-1.5 bg-white rounded-xl border border-slate-300 shadow-xs cursor-pointer hover:border-teal-600 transition-all group"
                    title="Click to expand QR Code"
                  >
                    <div className="h-14 w-14 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                      <QrCode className="h-10 w-10 text-white" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 group-hover:text-teal-700 block mt-0.5">
                      Scan at OPD
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Name of Cardholder
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {selectedAbhaMember.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        ABHA Number
                      </span>
                      <span className="font-mono font-bold text-teal-950 text-xs sm:text-sm">
                        {selectedAbhaMember.abhaId}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        ABHA Address
                      </span>
                      <span className="font-mono font-bold text-slate-700 text-xs">
                        {selectedAbhaMember.abhaAddress || `${selectedAbhaMember.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@abdm`}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Gender / Age
                      </span>
                      <span className="font-semibold text-slate-800">
                        {selectedAbhaMember.gender === 'F' ? 'Female' : selectedAbhaMember.gender === 'M' ? 'Male' : 'Other'} / {selectedAbhaMember.age} Years
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Blood Group
                      </span>
                      <span className="font-bold text-rose-600">
                        {selectedAbhaMember.bloodGroup}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Linked Mobile (Family Account)
                      </span>
                      <span className="font-mono font-semibold text-slate-800">
                        {selectedAbhaMember.hasOwnPhone && (selectedAbhaMember.personalPhone || selectedAbhaMember.phone !== '9876543210')
                          ? `+91 ${selectedAbhaMember.personalPhone || selectedAbhaMember.phone} (Personal Phone)`
                          : `+91 98765 43210 (Household Shared)`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Security Footer */}
              <div className="mt-6 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-teal-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Govt. of Gujarat Public Health Grid
                </span>
                <span className="font-mono">ABDM-SEC-PASS: #GUJ-2026-OK</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => showToast(`Downloaded ABHA Card for ${selectedAbhaMember.name} (PDF)`)}
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="h-4 w-4" />
                Download Card (PDF)
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard?.writeText(selectedAbhaMember.abhaId);
                  showToast(`Copied ABHA ID: ${selectedAbhaMember.abhaId}`);
                }}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                Copy ABHA ID
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* TAB 3: FAMILY HEALTH RECORDS VAULT */}
      {/* ================================================== */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            {/* Member Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Family Member:
              </span>
              <button
                onClick={() => setRecordFilterMemberId('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  recordFilterMemberId === 'ALL'
                    ? 'bg-teal-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Family ({MOCK_FAMILY_RECORDS.length})
              </button>
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setRecordFilterMemberId(m.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    recordFilterMemberId === m.id
                      ? 'bg-teal-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={recordFilterType}
                onChange={(e) => setRecordFilterType(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Record Types</option>
                <option value="PRESCRIPTION">Prescriptions</option>
                <option value="LAB_REPORT">Lab Reports</option>
                <option value="OPD_VISIT">Hospital OPD Visits</option>
                <option value="VACCINATION">Vaccination Certificates</option>
              </select>
            </div>
          </div>

          {/* Records List */}
          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center bg-slate-50">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No records found</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Try switching family member or record type filters.
                </p>
              </div>
            ) : (
              filteredRecords.map((rec) => {
                const getBadge = () => {
                  switch (rec.type) {
                    case 'PRESCRIPTION':
                      return (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                          <Pill className="h-3 w-3" /> Prescription
                        </span>
                      );
                    case 'LAB_REPORT':
                      return (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 text-[10px] font-bold">
                          <Activity className="h-3 w-3" /> Lab Diagnostics
                        </span>
                      );
                    case 'VACCINATION':
                      return (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 text-[10px] font-bold">
                          <ShieldCheck className="h-3 w-3" /> Immunization
                        </span>
                      );
                    default:
                      return (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                          <Building2 className="h-3 w-3" /> Hospital OPD Visit
                        </span>
                      );
                  }
                };

                return (
                  <div
                    key={rec.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-teal-500 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getBadge()}
                        <span className="text-xs font-bold text-slate-900">
                          {rec.title}
                        </span>
                        <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.2 rounded-full border border-teal-200">
                          👤 {rec.memberName} ({rec.relation})
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rec.summary}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          {rec.facility}
                        </span>
                        <span>•</span>
                        <span>{rec.doctor}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-slate-600">
                          <Calendar className="h-3 w-3" /> {rec.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => showToast(`Opened medical document for ${rec.memberName}`)}
                        className="text-xs h-8 px-3 rounded-xl border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5 mr-1 text-slate-500" />
                        Download
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* TAB 4: PHONE & ACCOUNT SETTINGS */}
      {/* ================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Primary Account Mobile Number
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                This is the head-of-household phone used for initial OTP login and shared dependent notifications.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    +91 98765 43210 (Primary Head)
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Aadhaar OTP & ABDM Connected
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast('Primary number edit requires Aadhaar OTP authentication.')}
                className="text-xs rounded-xl cursor-pointer"
              >
                Change Number
              </Button>
            </div>

            {/* Decoupling breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Family Phone Allocation Summary
              </h4>

              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{m.name}</span>
                      <span className="text-slate-400">({m.relationLabel})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.hasOwnPhone && (m.personalPhone || m.phone !== '9876543210') ? (
                        <span className="font-mono text-emerald-700 font-bold">
                          +91 {m.personalPhone || m.phone} (Personal)
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Shared on +91 98765 43210
                        </span>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAssigningMember(m)}
                        className="text-[11px] h-6 px-2 text-teal-700 hover:bg-teal-50 cursor-pointer"
                      >
                        {m.hasOwnPhone ? 'Edit' : 'Decouple'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AddFamilyMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Assign Phone Modal */}
      {assigningMember && (
        <AssignPhoneModal
          isOpen={true}
          member={assigningMember}
          onClose={() => setAssigningMember(null)}
        />
      )}
    </div>
  );
};
