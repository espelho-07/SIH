import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocationContext } from '@/contexts/LocationContext';
import { INITIAL_BLOOD_INVENTORY } from '@/mock/mockData';
import {
  Droplet,
  AlertTriangle,
  Heart,
  Building2,
  Phone,
  CheckCircle2,
  Radio,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface BloodCenter {
  id: string;
  name: string;
  licenseNo: string;
  type: 'BLOOD_BANK' | 'STORAGE_UNIT';
  totalCapacity: number;
  currentStock: number;
  phone: string;
  location: string;
  componentSeparation: boolean;
}

const MOCK_BLOOD_CENTRES: BloodCenter[] = [
  {
    id: 'bc_01',
    name: 'Gandhinagar Civil Hospital Blood Centre',
    licenseNo: 'GJ-BB-0412',
    type: 'BLOOD_BANK',
    totalCapacity: 500,
    currentStock: 112,
    phone: '079-2322-1918',
    location: 'Sector 12, Gandhinagar',
    componentSeparation: true,
  },
  {
    id: 'bc_02',
    name: 'Indian Red Cross Society Regional Centre',
    licenseNo: 'GJ-BB-0189',
    type: 'BLOOD_BANK',
    totalCapacity: 300,
    currentStock: 68,
    phone: '079-2324-4411',
    location: 'Sector 21, Gandhinagar',
    componentSeparation: true,
  },
  {
    id: 'bc_03',
    name: 'Kalol Sub-District Blood Storage Unit',
    licenseNo: 'GJ-BSU-0092',
    type: 'STORAGE_UNIT',
    totalCapacity: 100,
    currentStock: 24,
    phone: '02764-222300',
    location: 'Kalol SDH Campus',
    componentSeparation: false,
  },
];

export const DistrictBloodPage: React.FC = () => {
  const { selectedDistrict } = useLocationContext();
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [broadcastGroup, setBroadcastGroup] = useState('O-');

  // Groups and counts
  const bloodGroups = [
    { group: 'A+', count: 28, status: 'ADEQUATE', min: 20 },
    { group: 'A-', count: 6, status: 'LOW', min: 8 },
    { group: 'B+', count: 38, status: 'ADEQUATE', min: 20 },
    { group: 'B-', count: 8, status: 'ADEQUATE', min: 8 },
    { group: 'AB+', count: 18, status: 'ADEQUATE', min: 10 },
    { group: 'AB-', count: 4, status: 'CRITICAL', min: 6 },
    { group: 'O+', count: 42, status: 'ADEQUATE', min: 25 },
    { group: 'O-', count: 3, status: 'CRITICAL', min: 8 },
  ];

  const totalUnits = bloodGroups.reduce((acc, g) => acc + g.count, 0);
  const criticalShortages = bloodGroups.filter((g) => g.status === 'CRITICAL');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSuccess(
      `Emergency donor broadcast sent to ${broadcastGroup} registered voluntary blood donors across ${selectedDistrict} via SMS & HealthConnect App.`
    );
    setShowBroadcastModal(false);

    setTimeout(() => {
      setBroadcastSuccess(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Blood Bank & Components"
        subtitle={`Monitor whole blood units, rare groups, and blood bank storage across ${selectedDistrict} District.`}
        breadcrumbs={[
          { label: 'District Admin', to: '/district' },
          { label: 'Blood Bank' },
        ]}
        actions={
          <Button
            onClick={() => setShowBroadcastModal(true)}
            size="sm"
            className="gap-2 text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white"
          >
            <Radio className="h-4 w-4" />
            <span>Broadcast Donor Alert</span>
          </Button>
        }
      />

      {/* Critical Shortage Notice */}
      {criticalShortages.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-950">
          <AlertTriangle className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">Critical Blood Group Shortage Alert</h4>
            <p className="text-rose-800 mt-0.5">
              Reserves for{' '}
              {criticalShortages.map((c) => (
                <strong key={c.group} className="underline mx-1">
                  {c.group} ({c.count} units left)
                </strong>
              ))}{' '}
              have breached minimum safe buffer levels. Voluntary donor mobilization is required.
            </p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {broadcastSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          <p className="font-semibold">{broadcastSuccess}</p>
        </div>
      )}

      {/* 3 Decision-Driving KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Tested Units</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <Droplet className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalUnits} units</p>
          <span className="text-[11px] text-teal-700 font-medium">Whole blood & components tested</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Critical Group Alert</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{criticalShortages.length} Groups</p>
          <span className="text-[11px] text-rose-700 font-medium">O-Negative & AB-Negative below buffer</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Licensed Blood Facilities</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{MOCK_BLOOD_CENTRES.length} Centres</p>
          <span className="text-[11px] text-sky-700 font-medium">Cold chain certified</span>
        </Card>
      </div>

      {/* 8 Blood Groups Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">District Blood Stock by Group</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {bloodGroups.map((bg) => {
            const isCritical = bg.status === 'CRITICAL';
            const isLow = bg.status === 'LOW';

            return (
              <Card
                key={bg.group}
                className={`p-3.5 text-center transition-all ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/40 shadow-xs'
                    : isLow
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-lg font-black text-slate-900 block">{bg.group}</span>
                <p
                  className={`text-2xl font-black mt-1 ${
                    isCritical ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-teal-800'
                  }`}
                >
                  {bg.count}
                </p>
                <span className="text-[10px] text-slate-400 block mt-0.5">units</span>
                <span
                  className={`inline-block mt-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    isCritical
                      ? 'bg-rose-200 text-rose-900'
                      : isLow
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isCritical ? 'Critical' : isLow ? 'Low' : 'Adequate'}
                </span>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Blood Bank Facilities List */}
      <Card className="p-5 bg-white border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">District Blood Centers & Storage Units</h3>
            <p className="text-xs text-slate-500">Government and licensed voluntary blood collection & testing facilities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_BLOOD_CENTRES.map((bc) => (
            <div
              key={bc.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-100">
                    {bc.type === 'BLOOD_BANK' ? 'Full Blood Bank' : 'Storage Unit (BSU)'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{bc.licenseNo}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{bc.name}</h4>
                <p className="text-xs text-slate-500">{bc.location}</p>

                <div className="pt-2 border-t border-slate-200/60 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available Stock:</span>
                    <strong className="text-slate-900">{bc.currentStock} units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Storage Capacity:</span>
                    <strong className="text-slate-700">{bc.totalCapacity} units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Component Separator:</span>
                    <strong className={bc.componentSeparation ? 'text-emerald-700' : 'text-slate-500'}>
                      {bc.componentSeparation ? 'Available (PRBC/FFP)' : 'Whole Blood Only'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <a href={`tel:${bc.phone}`} className="flex items-center gap-1.5 text-xs text-teal-700 font-semibold">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{bc.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Broadcast Alert Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                <Radio className="h-5 w-5" />
                <h3>Emergency Donor Callout</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Required Blood Group</label>
                <select
                  value={broadcastGroup}
                  onChange={(e) => setBroadcastGroup(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-rose-600"
                >
                  <option value="O-">O-Negative (Universal Donor / Critical)</option>
                  <option value="AB-">AB-Negative (Rare)</option>
                  <option value="A-">A-Negative</option>
                  <option value="B-">B-Negative</option>
                  <option value="O+">O-Positive</option>
                  <option value="A+">A-Positive</option>
                  <option value="B+">B-Positive</option>
                  <option value="AB+">AB-Positive</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Donation Centre</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-rose-600">
                  <option>Gandhinagar Civil Hospital Blood Centre (Sector 12)</option>
                  <option>Red Cross Regional Blood Centre (Sector 21)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Urgency Alert Message</label>
                <textarea
                  rows={3}
                  defaultValue={`URGENT: ${broadcastGroup} blood units critically required at Gandhinagar Civil Hospital. Registered donors are requested to visit the Blood Centre immediately. Help save a life.`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-rose-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBroadcastModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs bg-rose-700 hover:bg-rose-800 text-white font-semibold"
                >
                  Broadcast Alert Now
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
