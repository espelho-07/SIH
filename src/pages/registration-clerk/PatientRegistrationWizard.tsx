import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registrationApi } from '@/api/registrationApi';
import { tokenApi } from '@/api/queueApi';
import { RegisteredPatient, Token, PriorityLevel } from '@/types/queue';
import { useLocationContext } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import { OpdTokenSlipModal } from './components/OpdTokenSlipModal';
import { LiveHospitalCaseSheet } from './components/LiveHospitalCaseSheet';
import {
  UserPlus,
  User,
  Phone,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Ticket,
  Building2,
  HeartHandshake,
  Calendar,
} from 'lucide-react';

export const PatientRegistrationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedFacility, selectedDistrict } = useLocationContext();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Personal & ABHA
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [age, setAge] = useState<string>('');
  const [dob, setDob] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [abhaVerified, setAbhaVerified] = useState(false);
  const [verifyingAbha, setVerifyingAbha] = useState(false);

  // Step 2: Demographics & Emergency Contact
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState(selectedDistrict || 'Gandhinagar');
  const [pincode, setPincode] = useState('382021');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');

  // Step 3: OPD Visit Setup
  const [departmentId, setDepartmentId] = useState('dep_med');
  const [priority, setPriority] = useState<PriorityLevel>('ROUTINE');
  const [autoIssueToken, setAutoIssueToken] = useState(true);

  // Duplicate Detection State
  const [duplicatePatient, setDuplicatePatient] = useState<RegisteredPatient | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [dismissDuplicate, setDismissDuplicate] = useState(false);

  // Success / Token Slip Modal State
  const [submitting, setSubmitting] = useState(false);
  const [createdToken, setCreatedToken] = useState<Token | null>(null);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [successPatient, setSuccessPatient] = useState<RegisteredPatient | null>(null);

  // Real-time Duplicate Check
  useEffect(() => {
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanAbha = abhaId.replace(/\D/g, '');

    if ((cleanPhone.length === 10 || cleanAbha.length === 14) && !dismissDuplicate) {
      const check = async () => {
        try {
          setCheckingDuplicate(true);
          const res = await registrationApi.checkDuplicate({
            phone: cleanPhone,
            abhaId: cleanAbha.length === 14 ? abhaId : undefined,
            name: name.trim().length > 2 ? name.trim() : undefined,
          });
          setDuplicatePatient(res.data || null);
        } catch (err) {
          console.error('Duplicate check error:', err);
        } finally {
          setCheckingDuplicate(false);
        }
      };
      check();
    } else if (cleanPhone.length < 10 && cleanAbha.length < 14) {
      setDuplicatePatient(null);
      setDismissDuplicate(false);
    }
  }, [phone, abhaId, dismissDuplicate, name]);

  // ABHA Simulation Verification
  const handleVerifyAbha = () => {
    if (!abhaId || abhaId.replace(/\D/g, '').length < 12) return;
    setVerifyingAbha(true);
    setTimeout(() => {
      setVerifyingAbha(false);
      setAbhaVerified(true);
    }, 600);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !age) {
      alert('Please complete all required fields (Name, Phone, Age).');
      return;
    }

    try {
      setSubmitting(true);
      // 1. Register Patient
      const patientData: Partial<RegisteredPatient> = {
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        gender,
        age: parseInt(age, 10),
        dob: dob || undefined,
        abhaId: abhaId.trim() || undefined,
        abhaVerified,
        address: address.trim() || undefined,
        district: district.trim() || 'Gandhinagar',
        pincode: pincode.trim() || undefined,
        emergencyContact: emergencyName
          ? {
              name: emergencyName.trim(),
              phone: emergencyPhone.replace(/\D/g, ''),
              relationship: emergencyRelation,
            }
          : undefined,
      };

      const res = await registrationApi.registerPatient(patientData);
      const registered = res.data;
      setSuccessPatient(registered);

      // 2. Generate Token if requested
      if (autoIssueToken && registered) {
        const deptNames: Record<string, string> = {
          dep_med: 'General Medicine OPD',
          dep_cardio: 'Cardiology Clinic',
          dep_ortho: 'Orthopedics Clinic',
          dep_peds: 'Pediatrics Clinic',
          dep_gyn: 'Gynecology & ANC',
        };

        const tokenRes = await tokenApi.generateToken({
          patientName: registered.name,
          patientPhone: registered.phone,
          facilityId: 'fac_civil_01',
          departmentId,
          priority,
        });

        if (tokenRes.data) {
          const t = tokenRes.data;
          t.departmentName = deptNames[departmentId] || 'General Medicine OPD';
          t.patientAge = registered.age;
          t.patientGender = registered.gender;
          setCreatedToken(t);
          setSlipModalOpen(true);
        }
      } else {
        alert(`Patient ${registered.name} registered successfully!`);
        navigate(`/registration-clerk/patients/${registered.id}`);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Failed to register patient. Please verify input fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setPhone('');
    setGender('M');
    setAge('');
    setDob('');
    setAbhaId('');
    setAbhaVerified(false);
    setAddress('');
    setEmergencyName('');
    setEmergencyPhone('');
    setDuplicatePatient(null);
    setDismissDuplicate(false);
    setCreatedToken(null);
    setSuccessPatient(null);
    setStep(1);
  };

  return (
    <div className="w-full space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/registration-clerk"
              className="text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Front Desk
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            New Patient Registration
          </h1>
          <p className="text-xs text-slate-500">
            Register citizen with ABHA ID check, demographic records, and live official OPD Case Paper generation for <strong className="text-slate-800 font-semibold">{selectedFacility}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono font-bold bg-teal-50 text-teal-900 border border-teal-200 px-3 py-1 rounded-full">
            Step {step} of 3
          </span>
        </div>
      </div>

      {/* 2-Column Split: Left Side Form, Right Side Live Case Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Registration Wizard Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* Progressive Step Breadcrumbs */}
          <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`text-left p-3 rounded-xl border transition-all ${
            step === 1
              ? 'bg-teal-50/80 border-teal-600 text-teal-950 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 block">1. Identity</span>
          <span className="text-xs truncate block">Name & ABHA</span>
        </button>

        <button
          type="button"
          onClick={() => setStep(2)}
          className={`text-left p-3 rounded-xl border transition-all ${
            step === 2
              ? 'bg-teal-50/80 border-teal-600 text-teal-950 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 block">2. Contact</span>
          <span className="text-xs truncate block">Address & Emergency</span>
        </button>

        <button
          type="button"
          onClick={() => setStep(3)}
          className={`text-left p-3 rounded-xl border transition-all ${
            step === 3
              ? 'bg-teal-50/80 border-teal-600 text-teal-950 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 block">3. OPD Visit</span>
          <span className="text-xs truncate block">Clinic & Token</span>
        </button>
      </div>

      {/* Inline Duplicate Detection Alert */}
      {duplicatePatient && !dismissDuplicate && (
        <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-5 shadow-sm space-y-3 animate-in fade-in-50">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-amber-950">
                Possible Duplicate Patient Record Detected!
              </h3>
              <p className="text-xs text-amber-900/80 mt-0.5">
                A patient matching this phone number or ABHA ID is already registered in the system.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-amber-200 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Registered Name:</span>
              <span className="font-bold text-slate-900">{duplicatePatient.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Demographics:</span>
              <span className="font-medium text-slate-800">
                {duplicatePatient.age} Years � {duplicatePatient.gender === 'M' ? 'Male' : 'Female'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Phone Number:</span>
              <span className="font-mono text-slate-800">+91 {duplicatePatient.phone}</span>
            </div>
            {duplicatePatient.abhaId && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">ABHA ID:</span>
                <span className="font-mono text-teal-800 font-bold">{duplicatePatient.abhaId}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDismissDuplicate(true)}
              className="text-xs text-slate-600 border-amber-200 hover:bg-amber-100/50"
            >
              Continue as New (Different Person)
            </Button>
            <Button
              type="button"
              onClick={() => navigate(`/registration-clerk/patients/${duplicatePatient.id}`)}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs gap-1.5 shadow-xs"
            >
              <User className="h-4 w-4" />
              Use Existing Patient & Issue Token
            </Button>
          </div>
        </div>
      )}

      {/* Step Form Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ========================================================================= */}
            {/* STEP 1: IDENTITY & ABHA */}
            {/* ========================================================================= */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="font-bold text-slate-900 text-base">Step 1: Patient Identity & ABHA</h2>
                  <p className="text-xs text-slate-500">Enter primary citizen identification details</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Rameshwar Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                        +91
                      </div>
                      <Input
                        required
                        type="tel"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="h-10 text-xs pl-11 font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">Used for SMS token updates & duplicates</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['M', 'F', 'Other'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`h-10 rounded-lg border text-xs font-semibold transition-all ${
                            gender === g
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Age (Years) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      required
                      type="number"
                      min={0}
                      max={120}
                      placeholder="e.g. 48"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Date of Birth (Optional)</label>
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                {/* ABHA ID Section */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-teal-700" />
                      <span className="text-xs font-bold text-slate-900">Ayushman Bharat Health Account (ABHA)</span>
                    </div>
                    {abhaVerified ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Optional for OPD walk-in</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="14-XXXX-XXXX-XXXX"
                      value={abhaId}
                      onChange={(e) => {
                        setAbhaId(e.target.value);
                        setAbhaVerified(false);
                      }}
                      className="h-10 text-xs font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerifyAbha}
                      disabled={verifyingAbha || !abhaId || abhaVerified}
                      className="text-xs font-semibold shrink-0 h-10 px-4"
                    >
                      {verifyingAbha ? 'Checking...' : abhaVerified ? 'Verified' : 'Verify ABHA'}
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Entering ABHA links previous medical history and allows automated digital health records handover.
                  </p>
                </div>

                {/* Next Action */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => {
                      if (!name.trim() || !phone.trim() || !age) {
                        alert('Please fill Name, Phone, and Age before continuing.');
                        return;
                      }
                      setStep(2);
                    }}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs gap-2 min-h-[42px] px-6 cursor-pointer"
                  >
                    Continue to Contact <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: DEMOGRAPHICS & EMERGENCY */}
            {/* ========================================================================= */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="font-bold text-slate-900 text-base">Step 2: Address & Emergency Contact</h2>
                  <p className="text-xs text-slate-500">Communication and attendant information</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Residential Address</label>
                  <Input
                    placeholder="House / Plot number, Street or Village"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">District</label>
                    <Input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Pincode</label>
                    <Input
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="h-10 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Emergency Contact Card */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <HeartHandshake className="h-4 w-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-900">Emergency Attendant / Contact</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-600 font-medium">Attendant Name</label>
                      <Input
                        placeholder="e.g. Sunita Sharma"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-600 font-medium">Attendant Phone</label>
                      <Input
                        type="tel"
                        maxLength={10}
                        placeholder="98765 43211"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, ''))}
                        className="h-9 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-600 font-medium">Relationship</label>
                      <select
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        className="w-full h-9 rounded-md border border-slate-300 bg-white shadow-2xs cursor-pointer px-2.5 text-xs text-slate-800"
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Child">Child</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Other">Other Attendant</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Identity
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs gap-2 min-h-[42px] px-6 cursor-pointer"
                  >
                    Continue to OPD Visit <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: OPD VISIT & TOKEN SETUP */}
            {/* ========================================================================= */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="font-bold text-slate-900 text-base">Step 3: OPD Clinic & Token Issuance</h2>
                  <p className="text-xs text-slate-500">Select department queue and issue walk-in token</p>
                </div>

                {/* Department Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target OPD Department / Clinic</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white shadow-2xs px-3 text-xs text-slate-900 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="dep_med">General Medicine OPD (Room 4 � Dr. Arvind Patel)</option>
                    <option value="dep_cardio">Cardiology Clinic (Room 6 � Dr. Arvind Patel)</option>
                    <option value="dep_ortho">Orthopedics Clinic (Room 8 � Dr. Rajesh Mehta)</option>
                    <option value="dep_peds">Pediatrics & Immunization (Room 2 � Dr. Sneha Desai)</option>
                    <option value="dep_gyn">Gynecology & ANC (Room 5 � Dr. Bhavna Joshi)</option>
                  </select>
                </div>

                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Patient Queue Priority</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: 'ROUTINE', label: 'Routine OPD', desc: 'Standard queue' },
                      { val: 'URGENT', label: 'Urgent / Senior', desc: 'Fast track queue' },
                      { val: 'EMERGENCY', label: 'Emergency Red', desc: 'Immediate room alert' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setPriority(item.val as PriorityLevel)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          priority === item.val
                            ? 'border-teal-700 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs block font-bold">{item.label}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-issue token toggle */}
                <div className="rounded-xl bg-teal-50/70 border border-teal-200 p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-teal-950 block">
                      Auto-issue OPD Token & Print Slip
                    </span>
                    <p className="text-[11px] text-teal-800 mt-0.5">
                      Automatically generates queue token number and displays printable slip upon registration.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoIssueToken}
                    onChange={(e) => setAutoIssueToken(e.target.checked)}
                    className="h-5 w-5 accent-teal-700 rounded cursor-pointer"
                  />
                </div>

                {/* Summary Box */}
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                    Registration Summary:
                  </span>
                  <p className="text-slate-600">
                    Citizen: <span className="font-bold text-slate-900">{name}</span> ({age}Y, {gender === 'M' ? 'Male' : 'Female'})
                  </p>
                  <p className="text-slate-600">
                    Phone: <span className="font-mono font-medium text-slate-900">+91 {phone}</span>
                    {abhaId && <span className="ml-2 text-teal-800 font-bold">� ABHA: {abhaId}</span>}
                  </p>
                </div>

                {/* Final Submission Buttons */}
                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Contact
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs gap-2 min-h-[44px] px-8 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {submitting ? 'Registering Citizen...' : 'Complete Registration & Issue Slip'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Post-Registration Options if Slip Modal Closed */}
      {successPatient && (
        <Card className="border-teal-200 bg-teal-50/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-teal-950">
                Registration Completed for {successPatient.name}
              </h4>
              <p className="text-[11px] text-teal-800">
                Patient ID: {successPatient.id} � Registered successfully in hospital directory.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetForm}
                className="text-xs font-semibold"
              >
                Register Another Patient
              </Button>
              <Link to={`/registration-clerk/patients/${successPatient.id}`}>
                <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold">
                  View Patient Card
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
        </div>

        {/* RIGHT COLUMN: Real-Time Live Hospital Case Sheet */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-3">
          <LiveHospitalCaseSheet
            hospitalName={selectedFacility}
            district={selectedDistrict}
            clerkName={user?.name || 'Counter 02 • Front Desk Clerk'}
            name={name}
            phone={phone}
            gender={gender}
            age={age}
            dob={dob}
            abhaId={abhaId}
            abhaVerified={abhaVerified}
            address={address}
            pincode={pincode}
            emergencyName={emergencyName}
            emergencyPhone={emergencyPhone}
            emergencyRelation={emergencyRelation}
            departmentId={departmentId}
            priority={priority}
            currentStep={step}
          />
        </div>
      </div>

      {/* OPD Token Slip Modal */}
      <OpdTokenSlipModal
        isOpen={slipModalOpen}
        onClose={() => setSlipModalOpen(false)}
        token={createdToken}
        hospitalName={selectedFacility}
      />
    </div>
  );
};
