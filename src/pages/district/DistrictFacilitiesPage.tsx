import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocationContext } from '@/contexts/LocationContext';
import { INITIAL_FACILITIES } from '@/mock/mockData';
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
} from 'lucide-react';

export const DistrictFacilitiesPage: React.FC = () => {
  const { selectedDistrict } = useLocationContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [onlyAvailableBeds, setOnlyAvailableBeds] = useState(false);

  // Filter facilities based on search, type, and availability
  const facilities = INITIAL_FACILITIES.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || f.type === typeFilter;
    const matchesBeds = !onlyAvailableBeds || f.availableBeds > 0;

    return matchesSearch && matchesType && matchesBeds;
  });

  // Calculate high-level KPIs
  const totalFacilities = INITIAL_FACILITIES.length;
  const totalBeds = INITIAL_FACILITIES.reduce((acc, f) => acc + f.totalBeds, 0);
  const availableBeds = INITIAL_FACILITIES.reduce((acc, f) => acc + f.availableBeds, 0);
  const totalIcuFree = INITIAL_FACILITIES.reduce((acc, f) => acc + (f.icuBedsAvailable || 0), 0);
  const emergencyReady = INITIAL_FACILITIES.filter((f) => f.emergencyAvailable).length;

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
        title="District Facilities"
        subtitle={`Directory, real-time bed capacity, and emergency readiness across ${selectedDistrict} district.`}
        breadcrumbs={[
          { label: 'District Admin', to: '/district' },
          { label: 'Facilities' },
        ]}
        actions={
          <Link to="/district/map">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
              <Map className="h-4 w-4 text-teal-700" />
              <span>View Map</span>
            </Button>
          </Link>
        }
      />

      {/* KPI Cards Deck */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border-slate-200 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Facilities</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalFacilities}</p>
          <span className="text-[11px] text-teal-700 font-medium">All operational in {selectedDistrict}</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Available Beds</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Bed className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {availableBeds} <span className="text-xs font-normal text-slate-500">/ {totalBeds}</span>
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">
            {Math.round((availableBeds / (totalBeds || 1)) * 100)}% free district-wide
          </span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Free ICU Beds</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalIcuFree}</p>
          <span className="text-[11px] text-sky-700 font-medium">Equipped with ventilators</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">24/7 Casualty Units</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{emergencyReady}</p>
          <span className="text-[11px] text-amber-700 font-medium">Emergency triage ready</span>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 bg-white border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by facility name, block, specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none shrink-0 px-1">
            <input
              type="checkbox"
              checked={onlyAvailableBeds}
              onChange={(e) => setOnlyAvailableBeds(e.target.checked)}
              className="rounded text-teal-700 focus:ring-teal-700 h-4 w-4 border-slate-300"
            />
            <span>Only show facilities with free beds</span>
          </label>
        </div>

        {/* Facility Type Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
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
                className="p-5 bg-white border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all flex flex-col justify-between"
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
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{fac.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bed Occupancy Bar */}
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5">
                        <Bed className="h-3.5 w-3.5 text-slate-400" />
                        Bed Occupancy
                      </span>
                      <span className="font-bold text-slate-900">
                        {fac.totalBeds - fac.availableBeds} / {fac.totalBeds}{' '}
                        <span
                          className={`text-[11px] ${
                            isHighOccupancy
                              ? 'text-rose-600 font-bold'
                              : isMediumOccupancy
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          ({occupancyRate}%)
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
                      <span>{fac.availableBeds} General Beds Free</span>
                      <span className="font-semibold text-teal-800">
                        {fac.icuBedsAvailable || 0} ICU Free
                      </span>
                    </div>
                  </div>

                  {/* Specialties Pills */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Key Specialties:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {fac.specialties.slice(0, 4).map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                      {fac.specialties.length > 4 && (
                        <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-medium self-center">
                          +{fac.specialties.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{fac.contactNumber || '079-2322-1911'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/district/facilities/${fac.id}`}>
                      <Button size="sm" className="gap-1.5 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white">
                        <span>Facility Details</span>
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
    </div>
  );
};
