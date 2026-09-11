import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saveOfflinePatient } from '@/lib/db';
import { useConnection } from '@/contexts/ConnectionContext';
import { AshaPatient } from '@/types/asha';
import { CheckCircle2, User, MapPin, HeartPulse, ArrowRight, ArrowLeft } from 'lucide-react';

export const PatientRegistration: React.FC = () => {
  const { refreshPendingCount, isOnline } = useConnection();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Personal
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('F');
  const [phone, setPhone] = useState('');

  // Step 2: Location & Emergency
  const [village, setVillage] = useState('Pethapur Ward 2');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Step 3: Health & Category
  const [abhaId, setAbhaId] = useState('');
  const [category, setCategory] = useState<AshaPatient['category']>('MATERNAL');
  const [isHighRisk, setIsHighRisk] = useState(false);
  const [riskReason, setRiskReason] = useState('');

  const handleSaveCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newCitizen: AshaPatient = {
        id: `asha_cit_${Date.now()}`,
        ashaId: 'usr_asha_01',
        ashaName: 'Sunita Devi',
        name,
        age: parseInt(age) || 28,
        gender,
        phone,
        village,
        address,
        emergencyContactName: emergencyName || 'Relative',
        emergencyContactPhone: emergencyPhone || phone,
        abhaId: abhaId || undefined,
        category,
        isHighRisk,
        highRiskReasons: isHighRisk && riskReason ? [riskReason] : undefined,
        registeredOffline: !isOnline,
        createdAt: new Date().toISOString(),
      };

      // Saves to IndexedDB and queues for automatic backend sync!
      await saveOfflinePatient(newCitizen);
      await refreshPendingCount();
      setIsSaved(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Register Citizen in Cohort"
        subtitle="Progressive frontline mobile registration. Works offline in rural hamlets using local IndexedDB."
        breadcrumbs={[{ label: 'ASHA Dashboard', to: '/asha' }, { label: 'Register Citizen' }]}
      />

      {isSaved ? (
        <Card className="border-emerald-200 bg-white p-8 text-center space-y-4 shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Citizen Registered Successfully!</h2>
          <p className="text-sm text-slate-600">
            Record for <strong>{name}</strong> is safely stored in your offline device storage and queued for central sync.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <Button
              onClick={() => {
                setName('');
                setAge('');
                setPhone('');
                setAddress('');
                setStep(1);
                setIsSaved(false);
              }}
              variant="primary"
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              Register Another Citizen
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-slate-200 bg-white shadow-md">
          {/* Step Indicator Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step === 1 ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                1
              </span>
              <span className="text-xs font-semibold text-slate-700">Personal</span>
            </div>

            <div className="h-0.5 w-8 bg-slate-200" />

            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step === 2 ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </span>
              <span className="text-xs font-semibold text-slate-700">Location</span>
            </div>

            <div className="h-0.5 w-8 bg-slate-200" />

            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step === 3 ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </span>
              <span className="text-xs font-semibold text-slate-700">Health Profile</span>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8">
            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="Full Name of Citizen"
                  placeholder="e.g. Geeta Ben Parmar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Age in Years"
                    type="number"
                    placeholder="e.g. 26"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />

                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'M' | 'F' | 'Other')}
                      className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Mobile Contact Number"
                  type="tel"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                <div className="pt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      if (!name) return;
                      setStep(2);
                    }}
                    variant="primary"
                    className="bg-emerald-700 hover:bg-emerald-800 gap-1.5 min-h-[44px]"
                  >
                    <span>Proceed to Location</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Location & Emergency */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Village / Ward
                  </label>
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="Pethapur Ward 1">Pethapur Ward 1</option>
                    <option value="Pethapur Ward 2">Pethapur Ward 2</option>
                    <option value="Pethapur Ward 3">Pethapur Ward 3</option>
                    <option value="Pethapur Ward 4">Pethapur Ward 4</option>
                  </select>
                </div>

                <Input
                  label="Street Address / House Landmark"
                  placeholder="e.g. Near Old Well, Rabari Vaas"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Emergency Contact Name"
                    placeholder="e.g. Ramesh Parmar (Husband)"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                  />

                  <Input
                    label="Emergency Phone"
                    type="tel"
                    placeholder="10-digit phone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <Button type="button" onClick={() => setStep(1)} variant="secondary">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    variant="primary"
                    className="bg-emerald-700 hover:bg-emerald-800 gap-1.5"
                  >
                    <span>Proceed to Health Category</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Health Profile & High Risk */}
            {step === 3 && (
              <form onSubmit={handleSaveCitizen} className="space-y-4">
                <Input
                  label="ABHA Health ID (Optional)"
                  placeholder="e.g. 14-8921-3409-7721"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                />

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Primary Cohort Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AshaPatient['category'])}
                    className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="MATERNAL">Maternal / Antenatal (ANC)</option>
                    <option value="INFANT">Infant & Child Immunization</option>
                    <option value="NCD_HYPERTENSION">NCD - Hypertension</option>
                    <option value="NCD_DIABETES">NCD - Diabetes</option>
                    <option value="ELDERLY">Geriatric / Elderly Care</option>
                    <option value="GENERAL">General Population</option>
                  </select>
                </div>

                {/* High-Risk Toggle */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-rose-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isHighRisk}
                      onChange={(e) => setIsHighRisk(e.target.checked)}
                      className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Mark as High-Risk Patient</span>
                  </label>

                  {isHighRisk && (
                    <Input
                      label="High-Risk Clinical Reason"
                      placeholder="e.g. Severe Anemia, BP > 160/100, Gestational Diabetes"
                      value={riskReason}
                      onChange={(e) => setRiskReason(e.target.value)}
                      required
                    />
                  )}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button type="button" onClick={() => setStep(2)} variant="secondary">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="bg-emerald-700 hover:bg-emerald-800 font-bold"
                    isLoading={isLoading}
                  >
                    Save Citizen to Local DB
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
