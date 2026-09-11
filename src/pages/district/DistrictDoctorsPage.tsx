import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocationContext } from '@/contexts/LocationContext';
import { INITIAL_FACILITIES } from '@/mock/mockData';
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
} from 'lucide-react';

interface DistrictDoctor {
  id: string;
  name: string;
  qualification: string;
  specialty: string;
  facilityId: string;
  facilityName: string;
  status: 'ON_DUTY' | 'IN_OPD' | 'IN_SURGERY' | 'OFF_DUTY';
  phone: string;
  email: string;
  opdSchedule: string;
  patientsToday: number;
  teleconsultEnabled: boolean;
  avatar?: string;
}

const MOCK_DISTRICT_DOCTORS: DistrictDoctor[] = [
  {
    id: 'doc_01',
    name: 'Dr. Arvind Patel',
    qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
    specialty: 'Cardiology',
    facilityId: 'fac_civil_01',
    facilityName: 'Gandhinagar Civil Hospital',
    status: 'IN_OPD',
    phone: '9876505678',
    email: 'dr.arvind.patel@gujarat.gov.in',
    opdSchedule: '09:00 AM – 01:00 PM (Mon-Sat)',
    patientsToday: 28,
    teleconsultEnabled: true,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc_02',
    name: 'Dr. Neha Vaghela',
    qualification: 'MBBS, DGO (Obstetrics & Gynecology)',
    specialty: 'Obstetrics & Gynecology',
    facilityId: 'fac_pet_04',
    facilityName: 'Pethapur Primary Health Centre',
    status: 'ON_DUTY',
    phone: '9876512345',
    email: 'dr.neha.vaghela@gujarat.health.gov.in',
    opdSchedule: '09:00 AM – 02:00 PM (Daily)',
    patientsToday: 19,
    teleconsultEnabled: true,
    avatar: 'https://images.unsplash.com/photo-1594824813504-4a6f23555230?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc_03',
    name: 'Dr. Meena Parmar',
    qualification: 'MBBS, MD (Pediatrics)',
    specialty: 'Pediatrics',
    facilityId: 'fac_mansa_02',
    facilityName: 'Mansa Community Health Centre',
    status: 'IN_OPD',
    phone: '9876523456',
    email: 'dr.meena.parmar@gujarat.gov.in',
    opdSchedule: '10:00 AM – 03:00 PM (Mon-Fri)',
    patientsToday: 32,
    teleconsultEnabled: true,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc_04',
    name: 'Dr. Rajesh Solanki',
    qualification: 'MBBS, MS (General Surgery)',
    specialty: 'General Surgery',
    facilityId: 'fac_civil_01',
    facilityName: 'Gandhinagar Civil Hospital',
    status: 'IN_SURGERY',
    phone: '9876534567',
    email: 'dr.rajesh.solanki@civilhospital.in',
    opdSchedule: '02:00 PM – 05:00 PM (Tue, Thu, Sat)',
    patientsToday: 14,
    teleconsultEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc_05',
    name: 'Dr. Anjali Mehta',
    qualification: 'MBBS, MD (Pulmonology)',
    specialty: 'Pulmonology',
    facilityId: 'fac_kalol_03',
    facilityName: 'Kalol Sub-District Hospital',
    status: 'ON_DUTY',
    phone: '9876545678',
    email: 'dr.anjali.mehta@gujarat.health.gov.in',
    opdSchedule: '09:00 AM – 01:00 PM (Mon-Sat)',
    patientsToday: 21,
    teleconsultEnabled: true,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc_06',
    name: 'Dr. Suresh Joshi',
    qualification: 'MBBS, MS (Orthopedics)',
    specialty: 'Orthopedics',
    facilityId: 'fac_civil_01',
    facilityName: 'Gandhinagar Civil Hospital',
    status: 'ON_DUTY',
    phone: '9876556789',
    email: 'dr.suresh.joshi@civilhospital.in',
    opdSchedule: '09:00 AM – 01:00 PM (Daily)',
    patientsToday: 26,
    teleconsultEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc_07',
    name: 'Dr. Hetal Chavda',
    qualification: 'MBBS (Medical Officer)',
    specialty: 'General Medicine',
    facilityId: 'fac_adraj_05',
    facilityName: 'Adraj Primary Health Centre',
    status: 'IN_OPD',
    phone: '9876567890',
    email: 'dr.hetal.chavda@gujarat.health.gov.in',
    opdSchedule: '09:00 AM – 04:00 PM (Mon-Fri)',
    patientsToday: 38,
    teleconsultEnabled: true,
  },
  {
    id: 'doc_08',
    name: 'Dr. Pradeep Desai',
    qualification: 'MBBS, MD (Pathology)',
    specialty: 'Pathology & Diagnostics',
    facilityId: 'fac_civil_01',
    facilityName: 'Gandhinagar Civil Hospital',
    status: 'ON_DUTY',
    phone: '9876578901',
    email: 'dr.pradeep.desai@civilhospital.in',
    opdSchedule: '08:00 AM – 04:00 PM (Daily)',
    patientsToday: 45,
    teleconsultEnabled: false,
  },
];

export const DistrictDoctorsPage: React.FC = () => {
  const { selectedDistrict } = useLocationContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const specialties = ['ALL', 'Cardiology', 'Pediatrics', 'Obstetrics & Gynecology', 'General Surgery', 'Pulmonology', 'Orthopedics', 'General Medicine'];

  const filteredDoctors = MOCK_DISTRICT_DOCTORS.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.facilityName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty = specialtyFilter === 'ALL' || doc.specialty === specialtyFilter;
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const totalDoctors = MOCK_DISTRICT_DOCTORS.length;
  const onDutyCount = MOCK_DISTRICT_DOCTORS.filter((d) => d.status === 'ON_DUTY' || d.status === 'IN_OPD').length;
  const teleconsultCount = MOCK_DISTRICT_DOCTORS.filter((d) => d.teleconsultEnabled).length;
  const totalPatientsToday = MOCK_DISTRICT_DOCTORS.reduce((acc, d) => acc + d.patientsToday, 0);

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
        subtitle={`Monitor doctor deployment, duty status, and daily patient load across ${selectedDistrict} District.`}
        breadcrumbs={[
          { label: 'District Admin', to: '/district' },
          { label: 'Doctors' },
        ]}
      />

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

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
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

                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  Duty Schedule
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
