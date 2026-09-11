import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { MapView } from '@/components/map/MapView';
import { INITIAL_FACILITIES } from '@/mock/mockData';
import { Facility, FacilityType } from '@/types/facility';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Stethoscope,
  Bed,
  Map as MapIcon,
  List,
  ArrowRight,
} from 'lucide-react';

export const FacilityDiscovery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);
  const [bedsOnly, setBedsOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');

  const filteredFacilities = useMemo(() => {
    return INITIAL_FACILITIES.filter((facility) => {
      const matchesSearch =
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        facility.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'ALL' || facility.type === selectedType;
      const matchesEmergency = !emergencyOnly || facility.emergencyAvailable;
      const matchesBeds = !bedsOnly || facility.availableBeds > 0;

      return matchesSearch && matchesType && matchesEmergency && matchesBeds;
    });
  }, [searchQuery, selectedType, emergencyOnly, bedsOnly]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Public Healthcare Facilities"
        subtitle="Discover verified district hospitals, community health centres, and primary clinics across Gandhinagar."
        breadcrumbs={[{ label: 'Dashboard', to: '/patient' }, { label: 'Facilities' }]}
        actions={
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold min-h-[38px] ${
                viewMode === 'LIST' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <List className="h-4 w-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold min-h-[38px] ${
                viewMode === 'MAP' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MapIcon className="h-4 w-4" />
              <span>GIS Map</span>
            </button>
          </div>
        }
      />

      {/* Search & Filter Bar */}
      <Card className="p-4 bg-white border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              type="search"
              placeholder="Search hospital, specialty (e.g. Cardiology), or block..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <option value="ALL">All Facility Types</option>
              <option value="DISTRICT_HOSPITAL">District Hospital</option>
              <option value="SUB_DISTRICT_HOSPITAL">Sub-District Hospital</option>
              <option value="CHC">Community Health Centre (CHC)</option>
              <option value="PHC">Primary Health Centre (PHC)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="h-4 w-4 rounded text-teal-700 focus:ring-teal-700"
              />
              <span>24/7 Emergency</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bedsOnly}
                onChange={(e) => setBedsOnly(e.target.checked)}
                className="h-4 w-4 rounded text-teal-700 focus:ring-teal-700"
              />
              <span>Beds Free</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Map View Mode */}
      {viewMode === 'MAP' && (
        <div className="space-y-4">
          <MapView facilities={filteredFacilities} className="h-[520px]" />
          <p className="text-xs text-slate-500 italic">
            Click any pin to inspect real-time bed availability, emergency unit status, and driving directions.
          </p>
        </div>
      )}

      {/* List View Mode */}
      {viewMode === 'LIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFacilities.map((facility) => (
            <Card key={facility.id} className="hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{facility.name}</h3>
                      {facility.isVerified && (
                        <span title="Govt. Verified Facility">
                          <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {facility.type.replace(/_/g, ' ')} • {facility.distanceKm} km away
                    </p>
                  </div>
                  {facility.isOpen ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      Open Now
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0">
                      Closed
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-1">{facility.address}</p>

                {/* Specialties Chips */}
                <div className="flex flex-wrap gap-1">
                  {facility.specialties.slice(0, 4).map((spec) => (
                    <span key={spec} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {spec}
                    </span>
                  ))}
                  {facility.specialties.length > 4 && (
                    <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      +{facility.specialties.length - 4} more
                    </span>
                  )}
                </div>

                {/* Resource Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Beds Free</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {facility.availableBeds} <span className="text-[10px] text-slate-500">/ {facility.totalBeds}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">ICU Free</span>
                    <span className="font-bold text-red-700 text-sm">{facility.icuBedsAvailable} beds</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Est. Wait</span>
                    <span className="font-bold text-teal-800 text-sm">{facility.currentWaitTimeMinutes}m</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Link to={`/patient/facilities/${facility.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Details
                    </Button>
                  </Link>
                  <Link to="/patient/tokens" className="flex-1">
                    <Button variant="primary" size="sm" className="w-full text-xs bg-teal-700 hover:bg-teal-800">
                      Get Token
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
