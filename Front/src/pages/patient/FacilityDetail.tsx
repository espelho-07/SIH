import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { INITIAL_FACILITIES, INITIAL_BLOOD_INVENTORY, INITIAL_MEDICINES } from '@/mock/mockData';
import {
  Building2,
  Phone,
  Navigation,
  ShieldCheck,
  Clock,
  Bed,
  Stethoscope,
  Ticket,
  Calendar,
  Droplet,
  Pill,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

export const FacilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const facility = INITIAL_FACILITIES.find((f) => f.id === id) || INITIAL_FACILITIES[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={facility.name}
        subtitle={`${facility.type.replace(/_/g, ' ')} • ${facility.address}`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/patient' },
          { label: 'Facilities', to: '/patient/facilities' },
          { label: facility.name },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`tel:${facility.contactNumber}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
            >
              <Phone className="h-4 w-4 text-slate-500" />
              Call Hospital
            </a>

            <a
              href={`https://maps.google.com/?q=${facility.coordinates.lat},${facility.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
            >
              <Navigation className="h-4 w-4 text-teal-700" />
              Directions
            </a>

            <Link to="/patient/tokens">
              <Button variant="primary" size="md" className="bg-teal-700 hover:bg-teal-800 text-white gap-1.5">
                <Ticket className="h-4 w-4" />
                Generate OPD Token
              </Button>
            </Link>
          </div>
        }
      />

      {/* Hero Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Bed Capacity</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {facility.availableBeds} <span className="text-xs text-slate-500 font-normal">/ {facility.totalBeds}</span>
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold">Vacant & Ready</span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-400">ICU Beds Free</span>
          <p className="text-2xl sm:text-3xl font-black text-red-600 mt-1">{facility.icuBedsAvailable}</p>
          <span className="text-[10px] text-slate-500">of {facility.icuBedsTotal} total ICU</span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-400">Average OPD Wait</span>
          <p className="text-2xl sm:text-3xl font-black text-teal-700 mt-1">{facility.currentWaitTimeMinutes}m</p>
          <span className="text-[10px] text-teal-800 font-medium">Estimated wait</span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-400">Accreditation</span>
          <div className="flex items-center justify-center gap-1 mt-2 text-teal-800 font-bold text-sm">
            <ShieldCheck className="h-5 w-5" />
            <span>Govt. Verified</span>
          </div>
          <span className="text-[10px] text-slate-400">NHM Gujarat Grid</span>
        </div>
      </div>

      {/* Departments & OPD Clinics */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">OPD Departments & Counters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {facility.departments.map((dept) => (
            <Card key={dept.id} className="p-4 space-y-2 border-slate-200">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>
                <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                  {dept.code}
                </span>
              </div>
              <p className="text-xs text-slate-500">Active Doctors on Duty: <strong>{dept.activeDoctors}</strong></p>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">Wait: {dept.currentWaitMinutes} mins</span>
                <span className="font-semibold text-emerald-700">OPD Open</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Equipment Readiness & Blood Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic Equipment */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-teal-700" />
              <CardTitle className="text-base font-bold">Diagnostic & Imaging Equipment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {facility.equipment.map((eq, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="font-medium text-slate-800">{eq.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{eq.quantity} units</span>
                  {eq.isOperational ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      ● Operational
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold">Under Maintenance</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Blood Stock Availability */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-red-600" />
              <CardTitle className="text-base font-bold">Blood Bank Stock (Gandhinagar Grid)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {INITIAL_BLOOD_INVENTORY.stock.map((b) => (
                <div key={b.bloodGroup} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <span className="text-xs font-extrabold text-red-700">{b.bloodGroup}</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{b.unitsAvailable}</p>
                  <span className="text-[10px] text-slate-400">units</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
