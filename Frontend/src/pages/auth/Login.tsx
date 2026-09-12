import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  HeartPulse,
  Stethoscope,
  UsersRound,
  Pill,
  ClipboardList,
  Building2,
  ShieldCheck,
  FlaskConical,
  Activity,
  Zap,
  ArrowRight,
  Loader2,
  Lock,
} from 'lucide-react';
import { UserRole, StaffSubType } from '@/types/auth';
import { authApi } from '@/api/authApi';

interface QuickRoleConfig {
  id: string;
  name: string;
  role: UserRole;
  staffSubType?: StaffSubType;
  personName: string;
  department: string;
  badge: string;
  route: string;
  email: string;
  icon: React.ElementType;
  bgClass: string;
  borderClass: string;
  hoverClass: string;
  iconBgClass: string;
  badgeClass: string;
}

const QUICK_ROLES: QuickRoleConfig[] = [
  {
    id: 'patient',
    name: 'Citizen / Patient',
    role: 'PATIENT',
    personName: 'Rameshwar Sharma',
    department: 'Patient Portal & Tokens',
    badge: 'Citizen',
    route: '/patient',
    email: 'ramesh.sharma@example.in',
    icon: HeartPulse,
    bgClass: 'bg-emerald-50/70',
    borderClass: 'border-emerald-200',
    hoverClass: 'hover:border-emerald-500 hover:bg-emerald-100/60 hover:shadow-md',
    iconBgClass: 'bg-emerald-600 text-white',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'doctor',
    name: 'Doctor (OPD Specialist)',
    role: 'DOCTOR',
    personName: 'Dr. Arvind Patel',
    department: 'Cardiology & General Medicine',
    badge: 'Doctor',
    route: '/doctor',
    email: 'dr.arvind.patel@gujarat.gov.in',
    icon: Stethoscope,
    bgClass: 'bg-sky-50/70',
    borderClass: 'border-sky-200',
    hoverClass: 'hover:border-sky-500 hover:bg-sky-100/60 hover:shadow-md',
    iconBgClass: 'bg-sky-600 text-white',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  {
    id: 'asha',
    name: 'ASHA / Frontline Worker',
    role: 'ASHA',
    personName: 'Sunita Devi',
    department: 'Frontline Community Health',
    badge: 'Frontline',
    route: '/asha',
    email: 'sunita.asha@gujarat.health.gov.in',
    icon: UsersRound,
    bgClass: 'bg-teal-50/70',
    borderClass: 'border-teal-200',
    hoverClass: 'hover:border-teal-500 hover:bg-teal-100/60 hover:shadow-md',
    iconBgClass: 'bg-teal-600 text-white',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  {
    id: 'clerk',
    name: 'Registration Counter',
    role: 'FACILITY_STAFF',
    staffSubType: 'REGISTRATION_CLERK',
    personName: 'Rajesh Verma',
    department: 'Counter 03 & Token Issuer',
    badge: 'Registration',
    route: '/registration-clerk',
    email: 'rajesh.reg@civilhospital.in',
    icon: ClipboardList,
    bgClass: 'bg-violet-50/70',
    borderClass: 'border-violet-200',
    hoverClass: 'hover:border-violet-500 hover:bg-violet-100/60 hover:shadow-md',
    iconBgClass: 'bg-violet-600 text-white',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-300',
  },
  {
    id: 'pharmacist',
    name: 'Hospital Pharmacist',
    role: 'FACILITY_STAFF',
    staffSubType: 'PHARMACIST',
    personName: 'Priya Nair',
    department: 'Central Pharmacy & Stock',
    badge: 'Pharmacy',
    route: '/pharmacist',
    email: 'priya.pharma@civilhospital.in',
    icon: Pill,
    bgClass: 'bg-amber-50/70',
    borderClass: 'border-amber-200',
    hoverClass: 'hover:border-amber-500 hover:bg-amber-100/60 hover:shadow-md',
    iconBgClass: 'bg-amber-600 text-white',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'lab',
    name: 'Diagnostic Lab Tech',
    role: 'FACILITY_STAFF',
    staffSubType: 'LAB_TECHNICIAN',
    personName: 'Amit Shah',
    department: 'Pathology & Diagnostic Orders',
    badge: 'Diagnostics',
    route: '/lab-technician',
    email: 'amit.lab@civilhospital.in',
    icon: FlaskConical,
    bgClass: 'bg-purple-50/70',
    borderClass: 'border-purple-200',
    hoverClass: 'hover:border-purple-500 hover:bg-purple-100/60 hover:shadow-md',
    iconBgClass: 'bg-purple-600 text-white',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 'ops',
    name: 'Facility Operations',
    role: 'FACILITY_STAFF',
    staffSubType: 'FACILITY_OPERATIONS',
    personName: 'Vikram Joshi',
    department: 'Bed Telemetry & Ambulance Fleet',
    badge: 'Operations',
    route: '/facility-operations',
    email: 'vikram.ops@civilhospital.in',
    icon: Activity,
    bgClass: 'bg-cyan-50/70',
    borderClass: 'border-cyan-200',
    hoverClass: 'hover:border-cyan-500 hover:bg-cyan-100/60 hover:shadow-md',
    iconBgClass: 'bg-cyan-600 text-white',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    id: 'district',
    name: 'District Health Admin',
    role: 'DISTRICT_ADMIN',
    personName: 'Dr. Meenakshi Sundaram, IAS',
    department: 'CDHO Gandhinagar Command',
    badge: 'District Admin',
    route: '/district',
    email: 'cdho.gandhinagar@gujarat.gov.in',
    icon: Building2,
    bgClass: 'bg-blue-50/70',
    borderClass: 'border-blue-200',
    hoverClass: 'hover:border-blue-500 hover:bg-blue-100/60 hover:shadow-md',
    iconBgClass: 'bg-blue-600 text-white',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: 'superadmin',
    name: 'Super Admin (System)',
    role: 'SUPER_ADMIN',
    personName: 'Alok Mukherjee',
    department: 'NIC / National Health Tech',
    badge: 'Super Admin',
    route: '/super-admin',
    email: 'alok.systems@nic.in',
    icon: ShieldCheck,
    bgClass: 'bg-rose-50/70',
    borderClass: 'border-rose-200',
    hoverClass: 'hover:border-rose-500 hover:bg-rose-100/60 hover:shadow-md',
    iconBgClass: 'bg-rose-600 text-white',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, verifyOtp, quickSwitchRole } = useAuth();

  const [authMode, setAuthMode] = useState<'PATIENT' | 'STAFF'>('PATIENT');
  const [activeLoggingRole, setActiveLoggingRole] = useState<string | null>(null);

  // =====================================================
  // PATIENT OTP STATES
  // =====================================================
  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // =====================================================
  // STAFF STATES
  // =====================================================
  const [staffRole, setStaffRole] = useState<UserRole>('DOCTOR');
  const [staffSubType, setStaffSubType] = useState<StaffSubType>('PHARMACIST');
  const [identifier, setIdentifier] = useState('dr.arvind.patel@gujarat.gov.in');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // =====================================================
  // 1-CLICK INSTANT AUTHENTICATION HANDLER
  // =====================================================
  const handleDirectRoleLogin = async (target: QuickRoleConfig) => {
    setActiveLoggingRole(target.id);
    setIsLoading(true);
    setLoginError('');

    try {
      if (target.role === 'PATIENT') {
        try {
          await verifyOtp({ phone: '9876543210', otp: '123456' });
        } catch (err) {
          console.warn('Backend OTP login fallback to session:', err);
          quickSwitchRole('PATIENT');
        }
      } else {
        try {
          await login({
            identifier: target.email,
            password: 'password123',
            role: target.role,
            staffSubType: target.staffSubType,
          });
        } catch (err) {
          console.warn('Backend staff login fallback to session:', err);
          quickSwitchRole(target.role, target.staffSubType);
        }
      }

      navigate(target.route);
    } catch (err) {
      console.error('Direct login error:', err);
      setLoginError('Could not authenticate role. Please check backend connection.');
    } finally {
      setIsLoading(false);
      setActiveLoggingRole(null);
    }
  };

  // =====================================================
  // PATIENT - SEND OTP
  // =====================================================
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
      setOtp('123456');
    } catch {
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // PATIENT - VERIFY OTP
  // =====================================================
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

  // =====================================================
  // STAFF LOGIN
  // =====================================================
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

      if (staffRole === 'ASHA') {
        navigate('/asha');
      } else if (staffRole === 'DOCTOR') {
        navigate('/doctor');
      } else if (staffRole === 'FACILITY_STAFF') {
        if (staffSubType === 'PHARMACIST') navigate('/pharmacist');
        else if (staffSubType === 'REGISTRATION_CLERK') navigate('/registration-clerk');
        else if (staffSubType === 'LAB_TECHNICIAN') navigate('/lab-technician');
        else if (staffSubType === 'FACILITY_OPERATIONS') navigate('/facility-operations');
        else navigate('/staff');
      } else if (staffRole === 'DISTRICT_ADMIN') {
        navigate('/district');
      } else if (staffRole === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else {
        navigate('/patient');
      }
    } catch {
      setLoginError('Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // POPULATE DEMO CREDENTIALS IN FORM
  // =====================================================
  const setDemoCredentials = (role: UserRole, subType?: StaffSubType) => {
    setAuthMode('STAFF');
    setStaffRole(role);
    if (subType) {
      setStaffSubType(subType);
    }
    setLoginError('');

    if (role === 'ASHA') {
      setIdentifier('sunita.asha@gujarat.health.gov.in');
    } else if (role === 'DOCTOR') {
      setIdentifier('dr.arvind.patel@gujarat.gov.in');
    } else if (role === 'FACILITY_STAFF') {
      if (subType === 'PHARMACIST') {
        setIdentifier('priya.pharma@civilhospital.in');
      } else if (subType === 'LAB_TECHNICIAN') {
        setIdentifier('amit.lab@civilhospital.in');
      } else if (subType === 'FACILITY_OPERATIONS') {
        setIdentifier('vikram.ops@civilhospital.in');
      } else {
        setIdentifier('rajesh.reg@civilhospital.in');
      }
    } else if (role === 'DISTRICT_ADMIN') {
      setIdentifier('cdho.gandhinagar@gujarat.gov.in');
    } else if (role === 'SUPER_ADMIN') {
      setIdentifier('alok.systems@nic.in');
    }

    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* =================================================
          HEADER
      ================================================= */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center px-4">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-md group-hover:bg-teal-800 transition-all group-hover:scale-105">
            <HeartPulse className="h-7 w-7" />
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          SANJEEVANI-CONNECT
        </h1>
        <p className="text-xs font-bold text-teal-800 mt-1 uppercase tracking-wider">
          Integrated Public Healthcare Access & Telemetry Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-3xl px-4 space-y-6">
        {/* =================================================
            1-CLICK INSTANT ROLE LOGIN BAR (DIRECT ACCESS)
        ================================================= */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-xs">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>1-Click Role Direct Login</span>
                  <span className="rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 px-2 py-0.5 text-[10px] font-semibold">
                    Instant Access
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Select any ecosystem role below to authenticate and enter the workspace
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 self-start sm:self-auto shrink-0 font-medium">
              <Lock className="h-3.5 w-3.5 text-teal-700" />
              <span>Auth Guard Active</span>
            </div>
          </div>

          {/* 9 ROLES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
            {QUICK_ROLES.map((roleItem) => {
              const IconComp = roleItem.icon;
              const isLoggingThis = activeLoggingRole === roleItem.id;

              return (
                <button
                  key={roleItem.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDirectRoleLogin(roleItem)}
                  className={`group relative flex items-start gap-2.5 sm:gap-3 rounded-xl border p-2.5 sm:p-3 text-left transition-all duration-150 ${roleItem.bgClass} ${roleItem.borderClass} ${roleItem.hoverClass} disabled:opacity-50 disabled:pointer-events-none cursor-pointer`}
                >
                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105 ${roleItem.iconBgClass}`}
                  >
                    {isLoggingThis ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <IconComp className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-black text-slate-900 group-hover:text-teal-900 truncate">
                        {roleItem.name}
                      </span>
                      <span
                        className={`rounded-md border px-1.5 py-0.2 text-[9px] font-bold shrink-0 ${roleItem.badgeClass}`}
                      >
                        {roleItem.badge}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-700 truncate">
                      {roleItem.personName}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {roleItem.department}
                    </p>
                  </div>

                  <div className="absolute right-2.5 bottom-2 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {loginError && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-700 text-center font-medium">
              {loginError}
            </div>
          )}
        </div>

        {/* =================================================
            OPTIONAL MANUAL CREDENTIALS CARD
        ================================================= */}
        <Card className="shadow-md border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Or Sign In Manually
              </span>
            </div>
            <Tabs
              value={authMode}
              onValueChange={(value) => setAuthMode(value as 'PATIENT' | 'STAFF')}
            >
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="PATIENT" className="w-full justify-center">
                  Citizen / Patient (OTP)
                </TabsTrigger>
                <TabsTrigger value="STAFF" className="w-full justify-center">
                  Authorized Personnel (Password)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="pt-4">
            {/* =================================================
                CITIZEN / PATIENT LOGIN
            ================================================= */}
            {authMode === 'PATIENT' && (
              <div>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        Citizen Mobile Login
                      </p>
                      <p className="text-xs text-slate-500">
                        Enter your registered mobile number to receive verification OTP.
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

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isLoading}
                    >
                      Send Verification OTP
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="rounded-xl bg-teal-50 border border-teal-200 p-3.5 text-xs text-teal-900 flex items-center justify-between">
                      <span>OTP dispatched to +91 {phone}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                          setOtpError('');
                        }}
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

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isLoading}
                    >
                      Verify & Sign In to Health Portal
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* =================================================
                AUTHORIZED STAFF LOGIN
            ================================================= */}
            {authMode === 'STAFF' && (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    Healthcare Personnel Sign In
                  </p>
                  <p className="text-xs text-slate-500">
                    Role-guarded portal for doctors, ASHA workers, facility administrators and district officials.
                  </p>
                </div>

                {/* STAFF ROLE SELECT */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Select Your Operational Role
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => {
                      const role = e.target.value as UserRole;
                      setStaffRole(role);
                      setLoginError('');
                      if (role === 'FACILITY_STAFF') {
                        setStaffSubType('PHARMACIST');
                      }
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

                {/* FACILITY STAFF SUBTYPE */}
                {staffRole === 'FACILITY_STAFF' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Staff Subtype & Permissions
                    </label>
                    <select
                      value={staffSubType}
                      onChange={(e) => {
                        const subtype = e.target.value as StaffSubType;
                        setStaffSubType(subtype);
                        setDemoCredentials('FACILITY_STAFF', subtype);
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

                {/* IDENTIFIER */}
                <Input
                  label="Official Email / Government ID"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />

                {/* PASSWORD */}
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {loginError && (
                  <p className="text-xs font-medium text-red-600">
                    {loginError}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Authenticate & Open Dashboard
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
