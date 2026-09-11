import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { UserRole, StaffSubType } from '@/types/auth';
import { HeartPulse, Phone, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/api/authApi';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, verifyOtp, quickSwitchRole } = useAuth();

  const [authMode, setAuthMode] = useState<'PATIENT' | 'STAFF'>('PATIENT');

  // Patient OTP states
  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Staff states
  const [staffRole, setStaffRole] = useState<UserRole>('DOCTOR');
  const [staffSubType, setStaffSubType] = useState<StaffSubType>('PHARMACIST');
  const [identifier, setIdentifier] = useState('dr.arvind.patel@gujarat.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsLoading(true);
    setOtpError('');
    try {
      await authApi.sendPatientOtp({ phone });
      setOtpSent(true);
      setOtp('123456'); // Pre-fill demo OTP for evaluator convenience
    } catch {
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setOtpError('Please enter the complete 6-digit OTP.');
      return;
    }
    setIsLoading(true);
    setOtpError('');
    try {
      await verifyOtp({ phone, otp });
      navigate('/patient');
    } catch {
      setOtpError('Invalid OTP entered. (Demo OTP is 123456)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    try {
      await login({
        identifier,
        password,
        role: staffRole,
        staffSubType: staffRole === 'FACILITY_STAFF' ? staffSubType : undefined,
      });

      if (staffRole === 'ASHA') navigate('/asha');
      else if (staffRole === 'DOCTOR') navigate('/doctor');
      else if (staffRole === 'FACILITY_STAFF') navigate('/staff');
      else if (staffRole === 'DISTRICT_ADMIN') navigate('/district');
      else if (staffRole === 'SUPER_ADMIN') navigate('/super-admin');
      else navigate('/patient');
    } catch {
      setLoginError('Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (role: UserRole, subType?: StaffSubType) => {
    setAuthMode('STAFF');
    setStaffRole(role);
    if (subType) setStaffSubType(subType);

    if (role === 'ASHA') {
      setIdentifier('sunita.asha@gujarat.health.gov.in');
    } else if (role === 'DOCTOR') {
      setIdentifier('dr.arvind.patel@gujarat.gov.in');
    } else if (role === 'FACILITY_STAFF') {
      if (subType === 'PHARMACIST') setIdentifier('priya.pharma@civilhospital.in');
      else if (subType === 'LAB_TECHNICIAN') setIdentifier('amit.lab@civilhospital.in');
      else if (subType === 'FACILITY_OPERATIONS') setIdentifier('vikram.ops@civilhospital.in');
      else setIdentifier('rajesh.reg@civilhospital.in');
    } else if (role === 'DISTRICT_ADMIN') {
      setIdentifier('cdho.gandhinagar@gujarat.gov.in');
    } else if (role === 'SUPER_ADMIN') {
      setIdentifier('alok.systems@nic.in');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-md group-hover:bg-teal-800 transition-colors">
            <HeartPulse className="h-7 w-7" />
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">HEALTHCONNECT</h2>
        <p className="text-xs font-semibold text-teal-800 mt-1 uppercase tracking-wider">
          Integrated Public Healthcare Access Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="pb-4">
            <Tabs value={authMode} onValueChange={(val) => setAuthMode(val as 'PATIENT' | 'STAFF')}>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="PATIENT" className="w-full justify-center">
                  Citizen / Patient
                </TabsTrigger>
                <TabsTrigger value="STAFF" className="w-full justify-center">
                  Authorized Staff
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            {/* CITIZEN LOGIN (Mobile + OTP) */}
            {authMode === 'PATIENT' && (
              <div>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">Citizen Mobile Login</p>
                      <p className="text-xs text-slate-500">
                        Enter your 10-digit mobile number to access your queue tokens and health records.
                      </p>
                    </div>

                    <Input
                      label="Mobile Number"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      error={otpError}
                      required
                    />

                    <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                      Send Verification OTP
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="rounded-xl bg-teal-50 border border-teal-200 p-3.5 text-xs text-teal-900 flex items-center justify-between">
                      <span>OTP dispatched to +91 {phone}</span>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-teal-700 font-bold underline hover:text-teal-900"
                      >
                        Change
                      </button>
                    </div>

                    <Input
                      label="Enter 6-Digit OTP"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      error={otpError}
                      helperText="Demo Evaluation OTP is 123456"
                      required
                    />

                    <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                      Verify & Sign In to Health Portal
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* AUTHORIZED STAFF LOGIN */}
            {authMode === 'STAFF' && (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">Healthcare Personnel Sign In</p>
                  <p className="text-xs text-slate-500">
                    Role-guarded portal for doctors, ASHA workers, facility administrators and district officials.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Select Your Operational Role
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setStaffRole(r);
                      setDemoCredentials(r, staffSubType);
                    }}
                    className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="ASHA">ASHA / ANM / CHO (Frontline)</option>
                    <option value="DOCTOR">Doctor / Medical Specialist</option>
                    <option value="FACILITY_STAFF">Hospital Facility Staff</option>
                    <option value="DISTRICT_ADMIN">District Health Admin</option>
                    <option value="SUPER_ADMIN">Super Admin (Technical Center)</option>
                  </select>
                </div>

                {staffRole === 'FACILITY_STAFF' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Staff Subtype & Permissions
                    </label>
                    <select
                      value={staffSubType}
                      onChange={(e) => {
                        const sub = e.target.value as StaffSubType;
                        setStaffSubType(sub);
                        setDemoCredentials('FACILITY_STAFF', sub);
                      }}
                      className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                    >
                      <option value="REGISTRATION_CLERK">Registration Clerk (Counter & Tokens)</option>
                      <option value="PHARMACIST">Pharmacist (Dispensing & Stock)</option>
                      <option value="LAB_TECHNICIAN">Lab Technician (Diagnostics)</option>
                      <option value="FACILITY_OPERATIONS">Facility Operations (Beds & Fleet)</option>
                    </select>
                  </div>
                )}

                <Input
                  label="Official Email / Government ID"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {loginError && <p className="text-xs font-medium text-red-600">{loginError}</p>}

                <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                  Authenticate & Open Dashboard
                </Button>
              </form>
            )}

            {/* Quick Demo Fill Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Demo Switcher
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDemoCredentials('DOCTOR')}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('ASHA')}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  ASHA
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('FACILITY_STAFF', 'PHARMACIST')}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  Pharmacist
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('FACILITY_STAFF', 'REGISTRATION_CLERK')}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  Registration
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('DISTRICT_ADMIN')}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  District Admin
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('SUPER_ADMIN')}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  Super Admin
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
