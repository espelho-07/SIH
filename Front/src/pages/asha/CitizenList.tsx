import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { INITIAL_ASHA_PATIENTS } from '@/mock/mockData';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Search, Activity, ClipboardList, Phone, ShieldAlert } from 'lucide-react';

export const CitizenList: React.FC = () => {
  const [search, setSearch] = useState('');
  const patients = INITIAL_ASHA_PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.village.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Citizens Cohort"
        subtitle="Community household roster assigned to your ASHA jurisdiction (Pethapur Cluster)."
        breadcrumbs={[{ label: 'ASHA Dashboard', to: '/asha' }, { label: 'Citizens' }]}
        actions={
          <Link to="/asha/patients/new">
            <Button variant="primary" size="sm" className="gap-1.5 bg-emerald-700 hover:bg-emerald-800">
              <UserPlus className="h-4 w-4" />
              <span>Register New Citizen</span>
            </Button>
          </Link>
        }
      />

      <Card className="p-4 bg-white border-slate-200">
        <Input
          type="search"
          placeholder="Search citizen by name, village ward, or mobile number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <Card key={patient.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{patient.name}</h3>
                  <p className="text-xs text-slate-500">
                    {patient.age} Yrs • {patient.gender === 'F' ? 'Female' : 'Male'} • {patient.village}
                  </p>
                </div>
                {patient.isHighRisk && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 animate-pulse">
                    High Risk
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 line-clamp-1">{patient.address}</p>

              <div className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-500 border border-slate-100">
                <span>Category: </span>
                <strong className="text-slate-700">{patient.category?.replace(/_/g, ' ')}</strong>
                {patient.abhaId && <span className="block mt-0.5 text-teal-800">ABHA: {patient.abhaId}</span>}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-100 mt-3">
              <a
                href={`tel:${patient.phone}`}
                className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Call citizen"
              >
                <Phone className="h-4 w-4" />
              </a>

              <div className="flex gap-2 flex-1">
                <Link to="/asha/vitals" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs min-h-[44px]">
                    Vitals
                  </Button>
                </Link>
                <Link to="/asha/screening" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full text-xs min-h-[44px] bg-emerald-700 hover:bg-emerald-800">
                    Screen
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
