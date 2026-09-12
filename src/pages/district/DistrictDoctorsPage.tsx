import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import { useLocationContext } from '@/contexts/LocationContext';
import { INITIAL_FACILITIES, INITIAL_DISTRICT_DOCTORS } from '@/mock/mockData';
import { mockState } from '@/mock/db';
import { DistrictDoctor } from '@/types/admin';
import {
  Stethoscope,
  Search,
  Building2,
  Phone,
  Video,
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  UserCheck,
  AlertCircle,
  Mail,
  Plus,
  X,
  Activity,
} from 'lucide-react';

export const DistrictDoctorsPage: React.FC = () => {
  const { selectedDistrict } = useLocationContext();
  const [doctorsList, setDoctorsList] = useState<DistrictDoctor[]>(() => {
    return mockState?.doctors?.length ? mockState.doctors : INITIAL_DISTRICT_DOCTORS;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals & Feedback
  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [docName, setDocName] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [facilityId, setFacilityId] = useState(INITIAL_FACILITIES[0]?.id || 'fac_civil_01');
  const [dutyStatus, setDutyStatus] = useState<DistrictDoctor['status']>('ON_DUTY');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [opdSchedule, setOpdSchedule] = useState('09:00 AM – 02:00 PM (Mon-Sat)');
  const [teleconsultEnabled, setTeleconsultEnabled] = useState(true);

  const specialties = [
    'ALL',
    'Cardiology',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'General Surgery',
    'Pulmonology',
    'Orthopedics',
    'General Medicine',
    'Pathology & Diagnostics',
    'Emergency & Trauma',
  ];

  const facilitiesInDistrict = mockState?.facilities?.length ? mockState.facilities : INITIAL_FACILITIES;

  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const matchedFac = facilitiesInDistrict.find((f) => f.id === facilityId) || facilitiesInDistrict[0];

    const newDoctorData: Partial<DistrictDoctor> = {
      name: docName.trim(),
      qualification: qualification.trim() || 'MBBS',
      specialty,
      facilityId: matchedFac?.id || 'fac_civil_01',
      facilityName: matchedFac?.name || `${selectedDistrict} Civil Hospital`,
      status: dutyStatus,
      phone: phone.trim() || '9876500000',
      email: email.trim() || `${docName.toLowerCase().replace(/[^a-z]/g, '')}@gujarat.health.gov.in`,
      opdSchedule: opdSchedule.trim() || '09:00 AM – 02:00 PM (Mon-Sat)',
      patientsToday: 0,
      teleconsultEnabled,
    };

    let created: DistrictDoctor;
    if (mockState && typeof mockState.addDoctor === 'function') {
      created = mockState.addDoctor(newDoctorData);
    } else {
      created = {
        ...newDoctorData,
        id: `doc_${Date.now()}`,
      } as DistrictDoctor;
    }

    setDoctorsList((prev) => [created, ...prev]);
    setShowAddModal(false);

    // Reset Form
    setDocName('');
    setQualification('');
    setPhone('');
    setEmail('');

    setSuccessToast(`Successfully posted ${created.name} (${created.specialty}) to ${created.facilityName}.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleStatusChange = (docId: string, newStatus: DistrictDoctor['status']) => {
    if (mockState && typeof mockState.updateDoctorStatus === 'function') {
      mockState.updateDoctorStatus(docId, newStatus);
    }
    setDoctorsList((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: newStatus } : d))
    );
  };

  const filteredDoctors = doctorsList.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.facilityName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty = specialtyFilter === 'ALL' || doc.specialty === specialtyFilter;
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const totalDoctors = doctorsList.length;
  const onDutyCount = doctorsList.filter((d) => d.status === 'ON_DUTY' || d.status === 'IN_OPD').length;
  const teleconsultCount = doctorsList.filter((d) => d.teleconsultEnabled).length;
  const totalPatientsToday = doctorsList.reduce((acc, d) => acc + d.patientsToday, 0);

  const getStatusBadge = (status: DistrictDoctor['status']) => {
    switch (status) {
      case 'IN_OPD':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">In OPD Consultation</span>;
      case 'ON_DUTY':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">On Duty</span>;
      case 'IN_SURGERY':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">In Surgery (OT)</span>;
      case 'OFF_DUTY':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Off Duty</span>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Doctors & Medical Officers"
        subtitle={`Manage doctor postings, duty status, and OPD clinical coverage across ${selectedDistrict} District.`}
        breadcrumbs={[
          { label: 'District Admin', to: '/district' },
          { label: 'Doctors' },
        ]}
        actions={
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="gap-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Doctor / Specialist</span>
          </Button>
        }
      />

      {/* Success Notification */}
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

      {/* 3 Decision-Driving KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Registered Doctors</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Stethoscope className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalDoctors}</p>
          <span className="text-[11px] text-teal-700 font-medium">In {selectedDistrict} public grid</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active On Duty</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{onDutyCount}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Currently consulting in OPD & wards</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Consultations Today</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalPatientsToday}</p>
          <span className="text-[11px] text-amber-700 font-medium">{teleconsultCount} doctors teleconsult-enabled</span>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 bg-white border-slate-200 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name, specialty, or facility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialtyFilter(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                specialtyFilter === spec
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {spec === 'ALL' ? 'All Specialties' : spec}
            </button>
          ))}
        </div>
      </Card>

      {/* Doctor Cards Grid */}
      {filteredDoctors.length === 0 ? (
        <Card className="p-12 text-center bg-white border-slate-200">
          <Stethoscope className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No doctors match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try broadening your search term or clearing specialty filters.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoctors.map((doc) => (
            <Card
              key={doc.id}
              className="p-5 bg-white border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {doc.avatar ? (
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-2xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-sm">
                        {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                      <p className="text-xs font-semibold text-teal-800">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-400">{doc.qualification}</p>
                    </div>
                  </div>

                  {getStatusBadge(doc.status)}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold">{doc.facilityName}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {doc.opdSchedule}
                    </span>
                    <span className="font-bold text-slate-900">
                      {doc.patientsToday} patients seen
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <a href={`tel:${doc.phone}`} className="flex items-center gap-1 text-slate-600 hover:text-teal-700">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{doc.phone}</span>
                  </a>
                  {doc.teleconsultEnabled && (
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold text-[10px] flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      e-Consult
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-500 font-medium">Duty:</label>
                  <select
                    value={doc.status}
                    onChange={(e) => handleStatusChange(doc.id, e.target.value as DistrictDoctor['status'])}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
                  >
                    <option value="ON_DUTY">On Duty</option>
                    <option value="IN_OPD">In OPD</option>
                    <option value="IN_SURGERY">In Surgery</option>
                    <option value="OFF_DUTY">Off Duty</option>
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ADD DOCTOR MODAL */}
      {showAddModal && (
        <Dialog open={showAddModal} onOpenChange={setShowAddModal} maxWidth="lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-teal-700" />
              <span>Register Doctor / Medical Officer</span>
            </DialogTitle>
            <DialogDescription>
              Assign and post a qualified doctor or clinical specialist to a government facility in {selectedDistrict}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddDoctorSubmit}>
            <DialogContent className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-2">
              {/* Row 1: Doctor Name & Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Full Name *</label>
                  <Input
                    required
                    placeholder="e.g. Dr. Rajesh Patel"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Qualifications *</label>
                  <Input
                    required
                    placeholder="e.g. MBBS, MD (Medicine)"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Specialty & Facility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Clinical Specialty *</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="flex min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    {specialties.filter((s) => s !== 'ALL').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Posting Public Facility *</label>
                  <select
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    className="flex min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    {facilitiesInDistrict.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Mobile Phone *</label>
                  <Input
                    required
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Gov Email ID</label>
                  <Input
                    type="email"
                    placeholder="e.g. dr.rajesh@gujarat.health.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 4: OPD Schedule & Initial Duty Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">OPD Timings</label>
                  <Input
                    placeholder="e.g. 09:00 AM – 01:00 PM (Daily)"
                    value={opdSchedule}
                    onChange={(e) => setOpdSchedule(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Current Duty Status</label>
                  <select
                    value={dutyStatus}
                    onChange={(e) => setDutyStatus(e.target.value as DistrictDoctor['status'])}
                    className="flex min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="ON_DUTY">On Duty</option>
                    <option value="IN_OPD">In OPD</option>
                    <option value="IN_SURGERY">In Surgery</option>
                    <option value="OFF_DUTY">Off Duty</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Teleconsultation toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={teleconsultEnabled}
                  onChange={(e) => setTeleconsultEnabled(e.target.checked)}
                  className="rounded text-teal-700 focus:ring-teal-500 h-4 w-4"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">Enable Teleconsultation (e-Sanjeevani Integration)</span>
                  <span className="text-[11px] text-slate-500">Allows remote patient video triage and primary health centre consultations</span>
                </div>
              </label>
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
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
              >
                Post Doctor
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
    </div>
  );
};
