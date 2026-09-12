import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import { useLocationContext } from '@/contexts/LocationContext';
import { INITIAL_FACILITIES } from '@/mock/mockData';
import { mockState } from '@/mock/db';
import { Facility } from '@/types/facility';
import {
  Building2,
  Search,
  Bed,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  Activity,
  Map,
  Plus,
  CheckCircle2,
  Eye,
  X,
} from 'lucide-react';

const COMMON_SPECIALTIES = [
  'General Medicine',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'General Surgery',
  'Orthopedics',
  'Cardiology',
  'Emergency & Trauma',
  'Ophthalmology',
  'Dental',
  'AYUSH',
  'Pathology & Lab',
];

export const DistrictFacilitiesPage: React.FC = () => {
  const { selectedDistrict } = useLocationContext();
  const [facilitiesList, setFacilitiesList] = useState<Facility[]>(() => {
    return mockState?.facilities?.length ? mockState.facilities : INITIAL_FACILITIES;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [onlyAvailableBeds, setOnlyAvailableBeds] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectFacility, setInspectFacility] = useState<Facility | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Add Facility Form State
  const [facName, setFacName] = useState('');
  const [facType, setFacType] = useState<Facility['type']>('CHC');
  const [blockName, setBlockName] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('382010');
  const [contactPhone, setContactPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('108');
  const [totalBeds, setTotalBeds] = useState('50');
  const [availableBeds, setAvailableBeds] = useState('20');
  const [icuBedsTotal, setIcuBedsTotal] = useState('6');
  const [icuBedsAvailable, setIcuBedsAvailable] = useState('2');
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [oxygenAvailable, setOxygenAvailable] = useState(true);
  const [bloodBankAvailable, setBloodBankAvailable] = useState(false);
  const [ambulanceAvailable, setAmbulanceAvailable] = useState(true);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([
    'General Medicine',
    'Emergency & Trauma',
  ]);

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleAddFacilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facName.trim()) return;

    const tBeds = parseInt(totalBeds, 10) || 30;
    const aBeds = Math.min(parseInt(availableBeds, 10) || 10, tBeds);
    const icuTotal = parseInt(icuBedsTotal, 10) || 4;
    const icuAvail = Math.min(parseInt(icuBedsAvailable, 10) || 2, icuTotal);

    const newFacData: Partial<Facility> = {
      name: facName.trim(),
      type: facType,
      district: selectedDistrict,
      state: 'Gujarat',
      address: address.trim() || `${blockName ? blockName + ' Block, ' : ''}${selectedDistrict}`,
      pincode: pincode.trim() || '382000',
      contactNumber: contactPhone.trim() || '+91 79 2320 0000',
      emergencyNumber: emergencyPhone.trim() || '108',
      totalBeds: tBeds,
      availableBeds: aBeds,
      icuBedsTotal: icuTotal,
      icuBedsAvailable: icuAvail,
      emergencyAvailable,
      oxygenAvailable,
      bloodBankAvailable,
      ambulanceAvailable,
      isOpen: true,
      isVerified: true,
      currentWaitTimeMinutes: 15,
      coordinates: { lat: 23.2156, lng: 72.6369 },
      departments: selectedSpecialties.map((spec, idx) => ({
        id: `d_${idx}`,
        name: spec,
        code: spec.slice(0, 3).toUpperCase(),
        activeDoctors: 2,
        currentWaitMinutes: 15,
        opdOpen: true,
      })),
      specialties: selectedSpecialties.length > 0 ? selectedSpecialties : ['General Medicine'],
      equipment: [],
      lastUpdated: new Date().toISOString(),
    };

    let created: Facility;
    if (mockState && typeof mockState.addFacility === 'function') {
      created = mockState.addFacility(newFacData);
    } else {
      created = {
        ...newFacData,
        id: `fac_${Date.now()}`,
      } as Facility;
    }

    setFacilitiesList((prev) => [created, ...prev]);
    setShowAddModal(false);

    // Reset Form
    setFacName('');
    setBlockName('');
    setAddress('');
    setContactPhone('');

    // Feedback
    setSuccessToast(`Successfully registered ${created.name} into the ${selectedDistrict} District Healthcare Network.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Filter facilities based on search, type, and availability
  const facilities = facilitiesList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || f.type === typeFilter;
    const matchesBeds = !onlyAvailableBeds || f.availableBeds > 0;

    return matchesSearch && matchesType && matchesBeds;
  });

  // Calculate high-level KPIs
  const totalFacilities = facilitiesList.length;
  const totalBedsCount = facilitiesList.reduce((acc, f) => acc + f.totalBeds, 0);
  const availableBedsCount = facilitiesList.reduce((acc, f) => acc + f.availableBeds, 0);
  const totalIcuFree = facilitiesList.reduce((acc, f) => acc + (f.icuBedsAvailable || 0), 0);
  const emergencyReady = facilitiesList.filter((f) => f.emergencyAvailable).length;

  const facilityTypeLabels: Record<string, string> = {
    ALL: 'All Facilities',
    DISTRICT_HOSPITAL: 'District Hospitals',
    CHC: 'Community Health Centres (CHC)',
    PHC: 'Primary Health Centres (PHC)',
    SUB_DISTRICT_HOSPITAL: 'Sub-District Hospitals',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Healthcare Facilities"
        subtitle={`Manage government hospitals, CHCs, and PHCs across ${selectedDistrict} District.`}
        breadcrumbs={[
          { label: 'District Admin', to: '/district' },
          { label: 'Facilities' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/district/map">
              <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
                <Map className="h-4 w-4 text-teal-700" />
                <span>View Map</span>
              </Button>
            </Link>
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="gap-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Facility / Hospital</span>
            </Button>
          </div>
        }
      />

      {/* Success Banner */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-900 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3 Clear Decision-Driving KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Facilities</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalFacilities}</p>
          <span className="text-[11px] text-teal-700 font-medium">Hospitals & health centres in {selectedDistrict}</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Available Beds</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Bed className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {availableBedsCount} <span className="text-xs font-normal text-slate-500">/ {totalBedsCount}</span>
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">
            {totalIcuFree} ICU beds free district-wide
          </span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Emergency & Casualty</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{emergencyReady}</p>
          <span className="text-[11px] text-rose-700 font-medium">
            24/7 trauma & casualty units active
          </span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by facility name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 self-start sm:self-center">
            <input
              type="checkbox"
              checked={onlyAvailableBeds}
              onChange={(e) => setOnlyAvailableBeds(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
            />
            <span>Show only facilities with free beds</span>
          </label>
        </div>

        {/* Facility Type Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {Object.entries(facilityTypeLabels).map(([typeKey, label]) => (
            <button
              key={typeKey}
              onClick={() => setTypeFilter(typeKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === typeKey
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Facilities Grid */}
      {facilities.length === 0 ? (
        <Card className="p-12 text-center bg-white border-slate-200">
          <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No facilities match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting the facility type filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('ALL');
              setOnlyAvailableBeds(false);
            }}
            className="mt-4 text-xs font-semibold"
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.map((fac) => {
            const occupancyRate =
              fac.totalBeds > 0
                ? Math.round(((fac.totalBeds - fac.availableBeds) / fac.totalBeds) * 100)
                : 0;

            const isHighOccupancy = occupancyRate >= 90;
            const isMediumOccupancy = occupancyRate >= 75 && occupancyRate < 90;

            return (
              <Card
                key={fac.id}
                className="p-5 bg-white border-slate-200 hover:border-teal-400 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top: Name, Badge, Type */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                          {fac.type.replace(/_/g, ' ')}
                        </span>
                        {fac.emergencyAvailable && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                            24/7 Casualty
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{fac.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{fac.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bed Occupancy Bar */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5">
                        <Bed className="h-3.5 w-3.5 text-slate-400" />
                        Bed Occupancy
                      </span>
                      <span className="font-bold text-slate-900">
                        {fac.availableBeds} Free{' '}
                        <span
                          className={`text-[11px] font-semibold ${
                            isHighOccupancy
                              ? 'text-rose-600'
                              : isMediumOccupancy
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          ({occupancyRate}% full)
                        </span>
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isHighOccupancy
                            ? 'bg-rose-500'
                            : isMediumOccupancy
                            ? 'bg-amber-500'
                            : 'bg-teal-600'
                        }`}
                        style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>{fac.totalBeds} total beds</span>
                      <span className="font-semibold text-teal-800">
                        {fac.icuBedsAvailable || 0} ICU Free
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    OPD Wait: <strong className="text-slate-800">~{fac.currentWaitTimeMinutes}m</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setInspectFacility(fac)}
                      className="gap-1 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Quick View</span>
                    </Button>
                    <Link to={`/district/facilities/${fac.id}`}>
                      <Button size="sm" className="gap-1.5 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white cursor-pointer">
                        <span>Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ADD GOVERNMENT FACILITY MODAL */}
      {showAddModal && (
        <Dialog open={showAddModal} onOpenChange={setShowAddModal} maxWidth="2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-teal-700" />
              <span>Add Government Healthcare Facility</span>
            </DialogTitle>
            <DialogDescription>
              Register a new public hospital, CHC, or PHC under {selectedDistrict} District Health Authority.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddFacilitySubmit}>
            <DialogContent className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-2">
              {/* Row 1: Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Facility / Hospital Name *</label>
                  <Input
                    required
                    placeholder="e.g. Sub-District Hospital Kalol"
                    value={facName}
                    onChange={(e) => setFacName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Facility Level / Type *</label>
                  <select
                    value={facType}
                    onChange={(e) => setFacType(e.target.value as Facility['type'])}
                    className="flex min-h-[40px] w-full rounded-lg border border-slate-300 bg-white shadow-2xs px-3 py-2 text-xs font-medium text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="DISTRICT_HOSPITAL">District Hospital (DH)</option>
                    <option value="SUB_DISTRICT_HOSPITAL">Sub-District Hospital (SDH)</option>
                    <option value="CHC">Community Health Centre (CHC)</option>
                    <option value="PHC">Primary Health Centre (PHC)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Block/Taluka & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Block / Taluka</label>
                  <Input
                    placeholder="e.g. Mansa Taluka"
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Full Campus Address *</label>
                  <Input
                    required
                    placeholder="e.g. Near Bus Station, Main Highway Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Contacts & PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contact / Reception Phone *</label>
                  <Input
                    required
                    placeholder="e.g. 02764-220000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Emergency Casualty Number</label>
                  <Input
                    placeholder="108 / Direct helpline"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Postal Pincode</label>
                  <Input
                    placeholder="e.g. 382010"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 4: Bed Capacity */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Bed className="h-4 w-4 text-teal-700" />
                  Bed Capacity & Infrastructure
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Total Sanctioned Beds</label>
                    <Input
                      type="number"
                      min="1"
                      value={totalBeds}
                      onChange={(e) => setTotalBeds(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Available Beds Free</label>
                    <Input
                      type="number"
                      min="0"
                      value={availableBeds}
                      onChange={(e) => setAvailableBeds(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Total ICU Beds</label>
                    <Input
                      type="number"
                      min="0"
                      value={icuBedsTotal}
                      onChange={(e) => setIcuBedsTotal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Available ICU Beds</label>
                    <Input
                      type="number"
                      min="0"
                      value={icuBedsAvailable}
                      onChange={(e) => setIcuBedsAvailable(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Emergency Capabilities Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={emergencyAvailable}
                    onChange={(e) => setEmergencyAvailable(e.target.checked)}
                    className="rounded text-teal-700 focus:ring-teal-500 h-4 w-4"
                  />
                  <span className="font-semibold text-slate-800">24/7 Casualty</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={oxygenAvailable}
                    onChange={(e) => setOxygenAvailable(e.target.checked)}
                    className="rounded text-teal-700 focus:ring-teal-500 h-4 w-4"
                  />
                  <span className="font-semibold text-slate-800">Oxygen Plant</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={bloodBankAvailable}
                    onChange={(e) => setBloodBankAvailable(e.target.checked)}
                    className="rounded text-teal-700 focus:ring-teal-500 h-4 w-4"
                  />
                  <span className="font-semibold text-slate-800">Blood Bank</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={ambulanceAvailable}
                    onChange={(e) => setAmbulanceAvailable(e.target.checked)}
                    className="rounded text-teal-700 focus:ring-teal-500 h-4 w-4"
                  />
                  <span className="font-semibold text-slate-800">Ambulance Base</span>
                </label>
              </div>

              {/* Row 6: Specialties Offered */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-slate-700">Active Clinical Specialties</label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SPECIALTIES.map((spec) => {
                    const isSelected = selectedSpecialties.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => toggleSpecialty(spec)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>
            </DialogContent>

            <DialogFooter>
              <Button
                onClick={() => setShowAddModal(false)}
                type="button"
                variant="secondary"
                size="sm"
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-teal-700 hover:bg-teal-800 text-white cursor-pointer font-semibold"
              >
                Register Government Facility
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}

      {/* QUICK INSPECT MODAL */}
      {inspectFacility && (
        <Dialog open={!!inspectFacility} onOpenChange={() => setInspectFacility(null)} maxWidth="xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                {inspectFacility.type.replace(/_/g, ' ')}
              </span>
              {inspectFacility.emergencyAvailable && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                  24/7 Casualty
                </span>
              )}
            </div>
            <DialogTitle className="mt-1">{inspectFacility.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{inspectFacility.address}, PIN: {inspectFacility.pincode}</span>
            </DialogDescription>
          </DialogHeader>

          <DialogContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Beds</span>
                <span className="text-xl font-bold text-slate-900">{inspectFacility.totalBeds}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-emerald-700 block text-[10px] uppercase font-bold">Available Free</span>
                <span className="text-xl font-bold text-emerald-800">{inspectFacility.availableBeds}</span>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-center">
                <span className="text-sky-700 block text-[10px] uppercase font-bold">ICU Free</span>
                <span className="text-xl font-bold text-sky-800">{inspectFacility.icuBedsAvailable || 0} / {inspectFacility.icuBedsTotal || 0}</span>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-center">
                <span className="text-teal-700 block text-[10px] uppercase font-bold">OPD Wait Time</span>
                <span className="text-xl font-bold text-teal-800">~{inspectFacility.currentWaitTimeMinutes}m</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-700">Contact Channels:</span>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>Reception: {inspectFacility.contactNumber}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />
                  <span>Emergency Helpline: {inspectFacility.emergencyNumber}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-700">Clinical Specialties:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {inspectFacility.specialties.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </DialogContent>

          <DialogFooter>
            <Button
              onClick={() => setInspectFacility(null)}
              variant="secondary"
              size="sm"
              className="cursor-pointer"
            >
              Close
            </Button>
            <Link to={`/district/facilities/${inspectFacility.id}`}>
              <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer">
                Open Full Facility Console
              </Button>
            </Link>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
};
