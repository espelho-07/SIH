import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage, supportedLanguages } from '@/locales/i18n';
import { mockState } from '@/mock/db';
import { operationsApi } from '@/api/operationsApi';
import { DoctorLeave, DistrictDoctor } from '@/types/admin';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
} from '@/components/ui/Dialog';
import {
  UserCheck,
  Calendar,
  CalendarDays,
  Clock,
  Shield,
  Stethoscope,
  Building2,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Trash2,
  X,
  Globe,
  Lock,
  ChevronLeft,
  ChevronRight,
  Heart,
  FileText,
  Save,
  Check,
  Loader2,
  FileEdit,
  XCircle,
  CalendarX,
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, role, staffSubType, updateUser } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Active Tab: if route is /doctor/roster or ?tab=roster, default to roster tab
  const isDoctor = role === 'DOCTOR';
  const initialTab =
    location.pathname.includes('/roster') || searchParams.get('tab') === 'roster'
      ? 'roster'
      : searchParams.get('tab') || 'personal';

  const [activeTab, setActiveTab] = useState<'personal' | 'credentials' | 'roster' | 'security'>(
    initialTab as any
  );

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // TAB 1: Personal & Contact Form State
  // -------------------------------------------------------------
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [age, setAge] = useState<number | string>(user?.age || '');
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>((user?.gender as any) || 'M');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'B+');
  const [address, setAddress] = useState(
    user?.address || 'Sector 14, Gandhinagar, Gujarat 382016'
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    user?.emergencyContactName || ''
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    user?.emergencyContactPhone || ''
  );
  const [bio, setBio] = useState(
    user?.bio ||
      (isDoctor
        ? 'Senior Consultant Medical Officer serving public healthcare with dedication.'
        : 'Registered public health portal user.')
  );

  // -------------------------------------------------------------
  // TAB 2: Professional Credentials State
  // -------------------------------------------------------------
  const [qualification, setQualification] = useState(
    user?.qualification || (isDoctor ? 'MBBS, MD (Medicine), DM (Cardiology)' : '')
  );
  const [specialty, setSpecialty] = useState(
    user?.specialty || (isDoctor ? 'Cardiology & Internal Medicine' : '')
  );
  const [licenseNumber, setLicenseNumber] = useState(
    user?.licenseNumber || (isDoctor ? 'GMC-MED-2018-88421' : 'GOV-ID-99214')
  );
  const [employeeId, setEmployeeId] = useState(user?.employeeId || 'GJ-HFW-8491');
  const [opdRoom, setOpdRoom] = useState('Room 104 (Ground Floor OPD)');
  const [teleconsultEnabled, setTeleconsultEnabled] = useState(true);

  // -------------------------------------------------------------
  // DOCTOR DUTY & ROSTER STATE
  // -------------------------------------------------------------
  const doctorKey = user?.id || 'usr_doc_01';
  const [dutyStatus, setDutyStatus] = useState<DistrictDoctor['status']>(() => {
    if (!isDoctor) return 'ON_DUTY';
    const check = mockState.isDoctorOnLeave(doctorKey);
    return check.onLeave ? 'ON_LEAVE' : 'ON_DUTY';
  });

  const [leaves, setLeaves] = useState<DoctorLeave[]>(() => {
    return mockState.getDoctorLeaves(doctorKey);
  });

  // Month Calendar Navigation (Default to Current Month: September 2026)
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(2026, 8, 1)); // September 2026

  // Leave Declaration Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [leaveEndDate, setLeaveEndDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [leaveCategory, setLeaveCategory] = useState<DoctorLeave['category']>('CASUAL');
  const [leaveReason, setLeaveReason] = useState('');
  const [handoverDoctor, setHandoverDoctor] = useState('Dr. Meena Parmar');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.phone || '9876505678');
  const [leaveNotes, setLeaveNotes] = useState('');
  const [applyingLeave, setApplyingLeave] = useState(false);
  const [leaveImpactPreview, setLeaveImpactPreview] = useState<{
    loading: boolean;
    affectedAppointmentsCount: number;
    coverageStatus: string;
    doctorsRemaining: number;
  }>({
    loading: false,
    affectedAppointmentsCount: 0,
    coverageStatus: 'ADEQUATE',
    doctorsRemaining: 1,
  });

  // Fetch pre-submission impact preview whenever modal opens or dates change
  useEffect(() => {
    if (!showLeaveModal || !leaveStartDate || !leaveEndDate) return;
    let isMounted = true;
    setLeaveImpactPreview((prev) => ({ ...prev, loading: true }));
    operationsApi
      .getLeaveImpact(doctorKey, leaveStartDate, leaveEndDate, 'fac_civil_01')
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setLeaveImpactPreview({
            loading: false,
            affectedAppointmentsCount: res.data.affectedAppointments?.length || 0,
            coverageStatus: res.data.coverageStatus,
            doctorsRemaining: res.data.availableDoctorsDuringPeriod,
          });
        }
      })
      .catch(() => {
        if (isMounted) setLeaveImpactPreview((prev) => ({ ...prev, loading: false }));
      });
    return () => {
      isMounted = false;
    };
  }, [showLeaveModal, leaveStartDate, leaveEndDate, doctorKey]);

  // Weekly OPD Schedule
  const [weeklySchedule] = useState({
    monday: '09:00 AM – 01:00 PM',
    tuesday: '09:00 AM – 01:00 PM',
    wednesday: '09:00 AM – 01:00 PM',
    thursday: '09:00 AM – 01:00 PM',
    friday: '09:00 AM – 01:00 PM',
    saturday: '09:00 AM – 12:30 PM',
  });

  // Sync user changes when user context updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      if (user.age) setAge(user.age);
      if (user.gender) setGender(user.gender);
      if (user.bloodGroup) setBloodGroup(user.bloodGroup);
      if (user.qualification) setQualification(user.qualification);
      if (user.specialty) setSpecialty(user.specialty);
      if (user.licenseNumber) setLicenseNumber(user.licenseNumber);
      if (user.employeeId) setEmployeeId(user.employeeId);
      if (user.bio) setBio(user.bio);
      if (user.address) setAddress(user.address);
    }
  }, [user]);

  // Refresh leaves and status
  const refreshDoctorRoster = () => {
    const activeLeaves = mockState.getDoctorLeaves(doctorKey);
    setLeaves([...activeLeaves]);
    const check = mockState.isDoctorOnLeave(doctorKey);
    setDutyStatus(check.onLeave ? 'ON_LEAVE' : 'ON_DUTY');
  };

  // -------------------------------------------------------------
  // SAVE PERSONAL PROFILE HANDLER
  // -------------------------------------------------------------
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      phone,
      email,
      age: Number(age) || undefined,
      gender: gender as any,
      bloodGroup,
      address,
      emergencyContactName,
      emergencyContactPhone,
      bio,
    });

    // If doctor, also update in mockState.doctors
    if (isDoctor) {
      mockState.updateDoctor(doctorKey, {
        name,
        phone,
        email,
      });
    }

    showToast(t('profile.personalSaved', 'Personal details successfully updated and saved.'));
  };

  // -------------------------------------------------------------
  // SAVE CREDENTIALS HANDLER
  // -------------------------------------------------------------
  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      qualification,
      specialty,
      licenseNumber,
      employeeId,
    });

    if (isDoctor) {
      mockState.updateDoctor(doctorKey, {
        qualification,
        specialty,
        teleconsultEnabled,
      });
    }

    showToast(t('profile.credentialsSaved', 'Professional credentials and governance details saved.'));
  };

  // -------------------------------------------------------------
  // DOCTOR QUICK DUTY STATUS TOGGLE
  // -------------------------------------------------------------
  const handleDutyToggle = (newStatus: DistrictDoctor['status']) => {
    setDutyStatus(newStatus);
    mockState.updateDoctorStatus(doctorKey, newStatus);
    showToast(`Duty status updated to: ${newStatus.replace('_', ' ')}`);
  };

  // -------------------------------------------------------------
  // SUBMIT LEAVE APPLICATION
  // -------------------------------------------------------------
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate) {
      alert('Please specify both start and end dates for your leave.');
      return;
    }
    if (!leaveReason.trim()) {
      alert('Please provide a reason / description for your leave.');
      return;
    }

    setApplyingLeave(true);
    try {
      const res = await operationsApi.applyLeave({
        doctorId: doctorKey,
        doctorName: user?.name || 'Dr. Arvind Patel',
        facilityId: 'fac_civil_01',
        facilityName: 'Civil Hospital Gandhinagar',
        department: user?.specialty || 'Cardiology',
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        category: leaveCategory,
        reason: leaveReason.trim(),
        status: 'PENDING',
        handoverDoctorName: handoverDoctor,
        emergencyContact: emergencyPhone,
        notes: leaveNotes.trim(),
      });

      if (res.success) {
        setShowLeaveModal(false);
        setLeaveReason('');
        setLeaveNotes('');
        refreshDoctorRoster();
        showToast('Leave request submitted to Facility Operations for operational review & coverage verification.');
      } else {
        alert(res.message || 'Failed to submit leave request');
      }
    } catch (err: any) {
      alert(err?.message || 'Error submitting leave request');
    } finally {
      setApplyingLeave(false);
    }
  };

  // -------------------------------------------------------------
  // CANCEL / WITHDRAW LEAVE HANDLER
  // -------------------------------------------------------------
  const handleCancelLeave = async (leaveId: string) => {
    if (window.confirm('Are you sure you want to cancel / withdraw this leave? Your OPD clinical availability will be restored.')) {
      try {
        await operationsApi.cancelLeave(leaveId, user?.name || 'Doctor');
        refreshDoctorRoster();
        showToast('Leave schedule withdrawn. OPD availability restored.');
      } catch (err: any) {
        alert(err?.message || 'Failed to cancel leave schedule.');
      }
    }
  };

  // -------------------------------------------------------------
  // CALENDAR GENERATION LOGIC
  // -------------------------------------------------------------
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const changeMonth = (offset: number) => {
    setCalendarDate(new Date(year, month + offset, 1));
  };

  // Check if a given day in the selected month is on leave
  const getDayLeaveInfo = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const matchingLeave = leaves.find((l) => {
      if (l.status === 'CANCELLED') return false;
      return dateStr >= l.startDate && dateStr <= l.endDate;
    });
    return matchingLeave;
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const handleCalendarDateClick = (dateStr: string) => {
    if (dateStr > todayStr) {
      setLeaveStartDate(dateStr);
      setLeaveEndDate(dateStr);
      setShowLeaveModal(true);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Success Notification Banner */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-fadeIn border border-emerald-400">
          <CheckCircle2 className="h-5 w-5 text-emerald-100 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg text-emerald-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* HERO USER PROFILE HEADER                                     */}
      {/* ----------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg border border-teal-700/50">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Initials */}
            <div className="relative">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-extrabold text-2xl sm:text-3xl shadow-xl ring-4 ring-white/20">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'HC'}
              </div>
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 ring-2 ring-teal-950 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            {/* Identity & Role Badges */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {user?.name || 'Public Health Officer'}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-teal-500/30 text-teal-200 border border-teal-400/40 uppercase tracking-wide">
                  <Shield className="h-3 w-3" />
                  {role === 'FACILITY_STAFF' && staffSubType
                    ? staffSubType.replace('_', ' ')
                    : role?.replace('_', ' ')}
                </span>
                {isDoctor && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      dutyStatus === 'ON_LEAVE'
                        ? 'bg-rose-500/30 text-rose-200 border-rose-400/40'
                        : dutyStatus === 'IN_OPD'
                        ? 'bg-amber-500/30 text-amber-200 border-amber-400/40'
                        : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {dutyStatus.replace('_', ' ')}
                  </span>
                )}
              </div>

              <p className="text-xs text-teal-200/80 font-medium flex flex-wrap items-center gap-x-4 gap-y-1">
                {user?.facilityName && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-teal-300" />
                    {user.facilityName}
                  </span>
                )}
                {user?.district && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-teal-300" />
                    {user.district} District
                  </span>
                )}
                {user?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-teal-300" />
                    +91 {user.phone}
                  </span>
                )}
              </p>

              {user?.abhaId && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold bg-white/10 px-2.5 py-1 rounded-lg text-teal-100 border border-white/10">
                    ABHA ID: {user.abhaId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Doctor Duty Status Toggle */}
          {isDoctor && (
            <div className="bg-teal-950/70 p-3.5 rounded-2xl border border-teal-700/60 backdrop-blur-md self-stretch sm:self-auto min-w-[240px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block mb-2">
                Live Doctor Duty Status
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDutyToggle('ON_DUTY')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dutyStatus === 'ON_DUTY'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white/10 text-teal-100 hover:bg-white/20'
                  }`}
                >
                  On Duty
                </button>
                <button
                  type="button"
                  onClick={() => handleDutyToggle('IN_OPD')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dutyStatus === 'IN_OPD'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white/10 text-teal-100 hover:bg-white/20'
                  }`}
                >
                  In OPD
                </button>
                <button
                  type="button"
                  onClick={() => handleDutyToggle('IN_SURGERY')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dutyStatus === 'IN_SURGERY'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white/10 text-teal-100 hover:bg-white/20'
                  }`}
                >
                  In OT / Surgery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDutyToggle('ON_LEAVE');
                    setActiveTab('roster');
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dutyStatus === 'ON_LEAVE'
                      ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300'
                      : 'bg-white/10 text-teal-100 hover:bg-white/20'
                  }`}
                >
                  On Leave
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* NAVIGATION TABS                                              */}
      {/* ----------------------------------------------------------- */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'personal'
              ? 'border-teal-700 text-teal-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Personal & Contact Info</span>
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'credentials'
              ? 'border-teal-700 text-teal-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Credentials & Governance</span>
        </button>

        {isDoctor && (
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'roster'
                ? 'border-teal-700 text-teal-900 bg-teal-50/60 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            <span className="flex items-center gap-1.5">
              Month Planner & Leaves
              {dutyStatus === 'ON_LEAVE' && (
                <span className="h-2 w-2 rounded-full bg-rose-500" />
              )}
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-teal-700 text-teal-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Security & Language</span>
        </button>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* TAB 1: PERSONAL & CONTACT INFORMATION                       */}
      {/* ----------------------------------------------------------- */}
      {activeTab === 'personal' && (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Personal Details & Demographics</span>
              <span className="text-xs font-normal text-slate-500">
                All updates reflect instantly in your session and patient-facing records.
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSavePersonal} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Official Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter full name"
                    className="h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Mobile Phone (+91)</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="10 digit mobile number"
                    className="h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@domain.gov.in"
                    className="h-10 text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Age</label>
                    <Input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Years"
                      className="h-10 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'M' | 'F' | 'Other')}
                      className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs cursor-pointer"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs cursor-pointer"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Residential / Postal Address</label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete postal address"
                    className="h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Emergency Contact Person</label>
                  <Input
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Next of kin / Spouse / Colleague"
                    className="h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Emergency Contact Number</label>
                  <Input
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+91 Phone number"
                    className="h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Professional Summary / Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief description of clinical experience, background, or public health responsibilities"
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs gap-2 px-6 h-10 shadow-sm cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save Personal Details
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 2: CREDENTIALS & GOVERNANCE                             */}
      {/* ----------------------------------------------------------- */}
      {activeTab === 'credentials' && (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Professional Credentials & Deployment Governance</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Role: {role}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveCredentials} className="space-y-6">
              {/* Doctor-Specific Credentials */}
              {isDoctor && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
                    <Stethoscope className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-teal-900">
                      <p className="font-bold">Gujarat Medical Council (GMC) & National Medical Commission (NMC)</p>
                      <p className="text-teal-700 mt-0.5">
                        These credentials verify your authority to issue electronic prescriptions, certify clinical referrals, and supervise public OPD services.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">State Medical Council Registration No.</label>
                      <Input
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g. GMC-MED-2018-88421"
                        className="h-10 text-xs font-semibold font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Clinical Specialty / Department</label>
                      <Input
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="e.g. Cardiology & Internal Medicine"
                        className="h-10 text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Highest Qualifications & Fellowships</label>
                      <Input
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="e.g. MBBS, MD (Medicine), DM (Cardiology)"
                        className="h-10 text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Assigned OPD Consultation Room</label>
                      <Input
                        value={opdRoom}
                        onChange={(e) => setOpdRoom(e.target.value)}
                        placeholder="e.g. Room 104 (Ground Floor OPD)"
                        className="h-10 text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Department / Employee Code</label>
                      <Input
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="e.g. GJ-HFW-8491"
                        className="h-10 text-xs font-semibold font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Teleconsultation Availability</p>
                        <p className="text-[11px] text-slate-500">Enable remote citizen video consultations</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={teleconsultEnabled}
                        onChange={(e) => setTeleconsultEnabled(e.target.checked)}
                        className="h-5 w-5 rounded-md accent-teal-700 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* District Admin Credentials */}
              {role === 'DISTRICT_ADMIN' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-700 shrink-0" />
                    <div>
                      <p className="font-bold">Chief District Health Officer (CDHO) Mandate</p>
                      <p className="text-indigo-700 mt-0.5">
                        Gazetted state authority governing public hospitals, CHCs, PHCs, blood centres, and medical personnel across {user?.district || 'Gandhinagar'} District.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Gazetted Officer Cadre ID</label>
                      <Input
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="h-10 text-xs font-semibold font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">District Jurisdiction</label>
                      <Input
                        disabled
                        value={`${user?.district || 'Gandhinagar'} District Health Authority`}
                        className="h-10 text-xs font-semibold bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ASHA Credentials */}
              {role === 'ASHA' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center gap-3">
                    <Heart className="h-5 w-5 text-teal-700 shrink-0" />
                    <div>
                      <p className="font-bold">National Health Mission (NHM) Accredited Social Health Activist</p>
                      <p className="text-teal-700 mt-0.5">
                        Authorized frontline health worker conducting door-to-door screenings, maternal checkups, and referral linkage.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">ASHA Registration Code</label>
                      <Input
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="h-10 text-xs font-semibold font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Sub-Centre / PHC Affiliation</label>
                      <Input
                        value={user?.facilityName || 'Pethapur Primary Health Centre'}
                        disabled
                        className="h-10 text-xs font-semibold bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Facility Staff Credentials */}
              {role === 'FACILITY_STAFF' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-amber-700 shrink-0" />
                    <div>
                      <p className="font-bold">Hospital Facility Operational Station</p>
                      <p className="text-amber-700 mt-0.5">
                        Designated staff role: {staffSubType ? staffSubType.replace('_', ' ') : 'Hospital Staff'} at {user?.facilityName || 'Civil Hospital'}.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Staff Badge ID</label>
                      <Input
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="h-10 text-xs font-semibold font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Assigned Desk / Counter</label>
                      <Input
                        value="Counter #02 (Ambulatory OPD Registration & ABHA)"
                        className="h-10 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Super Admin Credentials */}
              {role === 'SUPER_ADMIN' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-700 shrink-0" />
                    <div>
                      <p className="font-bold">HealthConnect Apex State Super Administrator</p>
                      <p className="text-red-700 mt-0.5">
                        Root privileges across all districts, doctor registries, database audit trails, and high-availability health grids.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Credentials */}
              {role === 'PATIENT' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-teal-700 shrink-0" />
                    <div>
                      <p className="font-bold">Ayushman Bharat Digital Health Account (ABHA)</p>
                      <p className="text-teal-700 mt-0.5">
                        Linked to your 14-digit national health identity: {user?.abhaId || '14-8921-3409-7721'}. Your health records are encrypted and patient-consented.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs gap-2 px-6 h-10 shadow-sm cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save Credentials
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 3: DOCTOR MONTH PLANNER & LEAVE SCHEDULE                */}
      {/* ----------------------------------------------------------- */}
      {activeTab === 'roster' && isDoctor && (
        <div className="space-y-6">
          {/* Active Leave Notice Banner */}
          {dutyStatus === 'ON_LEAVE' && (
            <div className="rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                      Doctor Currently On Leave
                    </span>
                    <span className="text-xs text-rose-100">Patient OPD booking is paused</span>
                  </div>
                  <p className="text-sm font-bold mt-1">
                    {leaves.find((l) => l.status === 'APPROVED' && todayStr >= l.startDate && todayStr <= l.endDate)?.reason ||
                      'Scheduled leave period active.'}
                  </p>
                  <p className="text-xs text-rose-100 mt-0.5">
                    District Health Directory and OPD counters show your status as{' '}
                    <span className="font-bold underline">"ON LEAVE (Not Available)"</span>.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleDutyToggle('ON_DUTY')}
                size="sm"
                className="bg-white text-rose-900 hover:bg-rose-50 font-bold text-xs shrink-0 cursor-pointer shadow"
              >
                End Leave Early & Resume OPD
              </Button>
            </div>
          )}

          {/* Month Roster Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-teal-700" />
                <span>Monthly Clinical Roster & Availability Planner</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Plan your leave days, academic summits, or emergency handovers so patients and district administrators know your schedule in advance.
              </p>
            </div>

            <Button
              onClick={() => setShowLeaveModal(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-2 h-10 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Plan / Declare Leave
            </Button>
          </div>

          {/* Calendar Grid & OPD Shifts View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Monthly Calendar (2 cols) */}
            <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeMonth(-1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-bold text-slate-900 min-w-[140px] text-center">
                    {monthNames[month]} {year}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeMonth(1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-semibold flex-wrap">
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    <Plus className="h-3 w-3" /> Click any date after today to apply leave
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    OPD Active
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-800">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    On Leave
                  </span>
                </div>
              </div>

              <div className="p-4">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty padding days */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-20 rounded-xl bg-slate-50/50 border border-transparent" />
                  ))}

                  {/* Month Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNumber = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                    const isToday = dateStr === todayStr;
                    const isFuture = dateStr > todayStr;
                    const dayLeave = getDayLeaveInfo(dayNumber);
                    const isSunday = (firstDayIndex + i) % 7 === 0;

                    return (
                      <div
                        key={dayNumber}
                        onClick={() => {
                          if (isFuture) {
                            handleCalendarDateClick(dateStr);
                          }
                        }}
                        title={
                          isFuture
                            ? `Click to declare leave starting ${dateStr}`
                            : isToday
                            ? `Today (${dateStr})`
                            : `Past date (${dateStr})`
                        }
                        className={`h-20 p-1.5 rounded-xl border transition-all flex flex-col justify-between text-left select-none ${
                          dayLeave
                            ? 'bg-rose-50/90 border-rose-300 ring-1 ring-rose-200 cursor-pointer hover:border-rose-400'
                            : isToday
                            ? 'bg-teal-50/90 border-teal-400 ring-2 ring-teal-200'
                            : isFuture
                            ? 'bg-white border-slate-200 hover:border-teal-500 hover:ring-2 hover:ring-teal-200 hover:bg-teal-50/50 hover:shadow-xs cursor-pointer group'
                            : isSunday
                            ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'
                            : 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-extrabold ${
                              isToday
                                ? 'h-5 w-5 rounded-full bg-teal-800 text-white flex items-center justify-center'
                                : dayLeave
                                ? 'text-rose-900'
                                : isFuture
                                ? 'text-slate-800 group-hover:text-teal-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {dayNumber}
                          </span>
                          {isToday && (
                            <span className="text-[9px] font-bold text-teal-800 uppercase">
                              Today
                            </span>
                          )}
                          {isFuture && !dayLeave && (
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-extrabold text-teal-700 bg-teal-100 px-1 py-0.5 rounded">
                              + Leave
                            </span>
                          )}
                        </div>

                        {dayLeave ? (
                          <div
                            className="bg-rose-200/80 text-rose-950 p-1 rounded-md text-[9px] font-bold truncate leading-tight border border-rose-300/80"
                            title={`${dayLeave.category}: ${dayLeave.reason}`}
                          >
                            🏖️ {dayLeave.category}
                          </div>
                        ) : isSunday ? (
                          <span className="text-[9px] font-medium text-slate-400">Weekly Off</span>
                        ) : (
                          <div
                            className={`p-0.5 rounded text-[9px] font-semibold truncate border ${
                              isFuture
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60 group-hover:border-teal-300 group-hover:bg-white'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            🩺 OPD 9-1
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Weekly Shift Hours & Stats (1 col) */}
            <div className="space-y-4">
              <Card className="border-slate-200 shadow-sm bg-white p-5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-700" />
                  <span>Standard OPD Shift Timings</span>
                </h3>

                <div className="space-y-2 text-xs">
                  {Object.entries(weeklySchedule).map(([day, slot]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <span className="capitalize font-bold text-slate-700">{day}</span>
                      <span className="font-semibold text-teal-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {slot}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500 mt-3 italic">
                  * Shifts automatically coordinate with token dispatch and patient arrival scheduling.
                </p>
              </Card>

              {/* Quick Summary Card */}
              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-teal-50 to-emerald-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                    {leaves.filter((l) => l.status === 'APPROVED').length}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Registered Leave Periods</p>
                    <p className="text-[11px] text-teal-800">
                      Synchronized across Gandhinagar District Health Network
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* REGISTERED LEAVES LIST                                     */}
          {/* --------------------------------------------------------- */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-teal-700" />
                  <span>Scheduled Leaves & Out-of-Office Records</span>
                </div>
                <span className="text-xs text-slate-500 font-normal">
                  {leaves.length} Total Records
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {leaves.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No scheduled leaves found. Click <strong>"Plan / Declare Leave"</strong> above to plan your upcoming time off.
                </div>
              ) : (
                <div className="space-y-3">
                  {leaves.map((leave) => {
                    const isActiveNow =
                      leave.status === 'APPROVED' &&
                      todayStr >= leave.startDate &&
                      todayStr <= leave.endDate;

                    return (
                      <div
                        key={leave.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isActiveNow
                            ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-200'
                            : leave.status === 'CANCELLED'
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-white">
                              {leave.category}
                            </span>
                            {isActiveNow && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                                CURRENTLY ON LEAVE
                              </span>
                            )}
                            {leave.status === 'PENDING' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                PENDING OPERATIONS REVIEW
                              </span>
                            )}
                            {leave.status === 'CHANGES_REQUIRED' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
                                <FileEdit className="w-3 h-3" />
                                CHANGES REQUESTED
                              </span>
                            )}
                            {leave.status === 'APPROVED' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                APPROVED & ACTIVE
                              </span>
                            )}
                            {leave.status === 'REJECTED' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                REJECTED
                              </span>
                            )}
                            {leave.status === 'CANCELLED' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
                                <CalendarX className="w-3 h-3" />
                                CANCELLED / WITHDRAWN
                              </span>
                            )}
                            {leave.affectedAppointmentsCount !== undefined && leave.affectedAppointmentsCount > 0 && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                {leave.affectedAppointmentsCount} Appts Impacted
                              </span>
                            )}
                            <span className="text-xs font-semibold text-slate-600">
                              📅 {leave.startDate} to {leave.endDate}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-slate-900 mt-1">
                            {leave.reason}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                            {leave.handoverDoctorName && (
                              <span>
                                🤝 Handover Covering OPD:{' '}
                                <strong className="text-slate-700">{leave.handoverDoctorName}</strong>
                              </span>
                            )}
                            {leave.emergencyContact && (
                              <span>
                                📞 Emergency Contact:{' '}
                                <strong className="text-slate-700">{leave.emergencyContact}</strong>
                              </span>
                            )}
                            {leave.notes && (
                              <span className="italic text-slate-600">
                                📝 Note: {leave.notes}
                              </span>
                            )}
                          </div>

                          {leave.changesRequestedNote && (
                            <div className="mt-2 p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
                              <span className="font-bold flex items-center gap-1 text-purple-800">
                                <FileEdit className="w-3.5 h-3.5 text-purple-600" />
                                Operations Coordinator Requested Clarification:
                              </span>
                              <p className="mt-1 font-medium">{leave.changesRequestedNote}</p>
                            </div>
                          )}

                          {leave.rejectionReason && (
                            <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                              <span className="font-bold flex items-center gap-1 text-rose-800">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Rejection Justification:
                              </span>
                              <p className="mt-1 font-medium">{leave.rejectionReason}</p>
                            </div>
                          )}
                        </div>

                        {leave.status !== 'CANCELLED' && (
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelLeave(leave.id)}
                              className="text-xs text-rose-700 hover:bg-rose-50 hover:border-rose-300 border-slate-200 gap-1.5 cursor-pointer font-semibold"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Cancel Leave</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 4: SECURITY & APPLICATION PREFERENCES                   */}
      {/* ----------------------------------------------------------- */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="h-4 w-4 text-teal-700" />
                <span>Application Language Preference</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {supportedLanguages.map((lang) => {
                  const isSelected = (i18n.language || 'en') === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        changeAppLanguage(lang.code);
                        showToast(`Application language updated to: ${lang.nativeName} (${lang.name})`);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-200'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{lang.nativeName}</p>
                        <p className="text-[11px] text-slate-500">{lang.name}</p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-teal-700" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-teal-700" />
                <span>Security & Consent Architecture</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">ABDM Milestones M1, M2 & M3 Compliance</p>
                  <p className="text-[11px] text-slate-500">
                    Consent Manager, Health Information Provider (HIP), and Health Information User (HIU) enabled.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Role-Based Session Tokens & Cryptographic Signatures</p>
                  <p className="text-[11px] text-slate-500">
                    All audit trails, OPD token creations, and referral orders are tamper-proof logged.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  ENFORCED
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* DECLARE LEAVE MODAL DIALOG (Wide max-w-2xl)                 */}
      {/* ----------------------------------------------------------- */}
      <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal} maxWidth="2xl">
        <DialogContent
          className="bg-white rounded-3xl p-0 overflow-hidden shadow-2xl border border-slate-200"
        >
          <div className="bg-slate-900 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-white">
                    Apply for Leave
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-300 mt-0.5">
                    Schedule time off and assign a colleague to cover your duties.
                  </DialogDescription>
                </div>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleApplyLeave} className="p-5 space-y-4">
            {/* Simple Notice */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Your status will show as <strong>On Leave</strong> during this period, and patient visits will be directed to your covering colleague.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Start Date *</label>
                <Input
                  type="date"
                  required
                  value={leaveStartDate}
                  onChange={(e) => setLeaveStartDate(e.target.value)}
                  className="h-9 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">End Date *</label>
                <Input
                  type="date"
                  required
                  value={leaveEndDate}
                  onChange={(e) => setLeaveEndDate(e.target.value)}
                  className="h-9 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Leave Type *</label>
                <select
                  value={leaveCategory}
                  onChange={(e) => setLeaveCategory(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 shadow-2xs cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="CASUAL">Casual Leave (CL)</option>
                  <option value="SICK">Medical / Sick Leave (ML)</option>
                  <option value="CONFERENCE">Conference / CME</option>
                  <option value="EMERGENCY">Emergency Leave</option>
                  <option value="EARNED">Earned / Privilege Leave</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Covering Doctor *</label>
                <Input
                  value={handoverDoctor}
                  onChange={(e) => setHandoverDoctor(e.target.value)}
                  placeholder="e.g. Dr. Meena Parmar"
                  required
                  className="h-9 text-xs font-medium"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Reason for Leave *
                </label>
                <textarea
                  rows={2}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Annual leave / Attending medical conference"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Emergency Phone</label>
                <Input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="h-9 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Handover Instructions (Optional)</label>
                <Input
                  value={leaveNotes}
                  onChange={(e) => setLeaveNotes(e.target.value)}
                  placeholder="e.g. Inpatient ICU rounds assigned to Dr. Meena"
                  className="h-9 text-xs font-medium"
                />
              </div>
            </div>

            {/* Quick Coverage Check */}
            {(leaveStartDate && leaveEndDate) && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <span>
                    Dept Coverage: <strong className={leaveImpactPreview.doctorsRemaining === 0 ? 'text-rose-600' : 'text-slate-800'}>
                      {leaveImpactPreview.doctorsRemaining} on duty
                    </strong>
                    {leaveImpactPreview.affectedAppointmentsCount > 0 && (
                      <span className="ml-2 text-amber-700 font-medium">
                        • {leaveImpactPreview.affectedAppointmentsCount} appts to reschedule
                      </span>
                    )}
                  </span>
                </div>
                {leaveImpactPreview.loading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLeaveModal(false)}
                className="text-xs font-semibold h-9 px-3.5 cursor-pointer"
                disabled={applyingLeave}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={applyingLeave}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 h-9 shadow-xs cursor-pointer gap-1.5"
              >
                {applyingLeave ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
