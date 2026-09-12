import React, { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapView } from '@/components/map/MapView';
import { INITIAL_FACILITIES } from '@/mock/mockData';
import { Link } from 'react-router-dom';

import {
  Search,
  MapPin,
  Building2,
  Stethoscope,
  Bed,
  Clock,
  Phone,
  Map as MapIcon,
  List,
  ShieldCheck,
} from 'lucide-react';

export const FacilityDiscovery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [bedsOnly, setBedsOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');

  const filteredFacilities = useMemo(() => {
    return INITIAL_FACILITIES.filter((facility) => {
      const search = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !search ||
        facility.name.toLowerCase().includes(search) ||
        facility.district.toLowerCase().includes(search) ||
        facility.specialties.some((specialty) =>
          specialty.toLowerCase().includes(search)
        );

      const matchesType =
        selectedType === 'ALL' || facility.type === selectedType;

      const matchesEmergency =
        !emergencyOnly || facility.emergencyAvailable;

      const matchesBeds =
        !bedsOnly || facility.availableBeds > 0;

      return (
        matchesSearch &&
        matchesType &&
        matchesEmergency &&
        matchesBeds
      );
    });
  }, [searchQuery, selectedType, emergencyOnly, bedsOnly]);

  const getFacilityType = (type: string) => {
    switch (type) {
      case 'DISTRICT_HOSPITAL':
        return 'District Hospital';
      case 'SUB_DISTRICT_HOSPITAL':
        return 'Sub-District Hospital';
      case 'CHC':
        return 'Community Health Centre';
      case 'PHC':
        return 'Primary Health Centre';
      default:
        return 'Hospital';
    }
  };

  return (
    <div className="space-y-4">

      {/* =========================
          HEADER
      ========================== */}

      <PageHeader
        title="Find a Hospital"
        subtitle="Find a hospital or health centre near you."
        breadcrumbs={[
          { label: 'Dashboard', to: '/patient' },
          { label: 'Hospitals' },
        ]}
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">

            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                viewMode === 'LIST'
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>

            <button
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                viewMode === 'MAP'
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              Map
            </button>

          </div>
        }
      />

      {/* =========================
          SEARCH & FILTER
      ========================== */}

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-3">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">

            {/* Search */}

            <div className="md:col-span-2 relative">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital or area..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />

            </div>

            {/* Hospital Type */}

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none focus:border-teal-500"
            >
              <option value="ALL">All Hospitals</option>
              <option value="DISTRICT_HOSPITAL">
                District Hospital
              </option>
              <option value="SUB_DISTRICT_HOSPITAL">
                Sub-District Hospital
              </option>
              <option value="CHC">
                Community Health Centre
              </option>
              <option value="PHC">
                Primary Health Centre
              </option>
            </select>

            {/* Filters */}

            <div className="flex items-center gap-4 px-1">

              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700">

                <input
                  type="checkbox"
                  checked={emergencyOnly}
                  onChange={(e) =>
                    setEmergencyOnly(e.target.checked)
                  }
                  className="h-3.5 w-3.5 rounded border-slate-300 text-teal-700"
                />

                Emergency

              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700">

                <input
                  type="checkbox"
                  checked={bedsOnly}
                  onChange={(e) =>
                    setBedsOnly(e.target.checked)
                  }
                  className="h-3.5 w-3.5 rounded border-slate-300 text-teal-700"
                />

                Beds Available

              </label>

            </div>

          </div>

        </CardContent>
      </Card>

      {/* =========================
          RESULT COUNT
      ========================== */}

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-semibold text-slate-900">
            Hospitals near you
          </p>

          <p className="text-[11px] text-slate-500">
            {filteredFacilities.length} hospitals found
          </p>
        </div>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-medium text-teal-700 hover:underline"
          >
            Clear search
          </button>
        )}

      </div>

      {/* =========================
          MAP
      ========================== */}

      {viewMode === 'MAP' && (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <MapView
            facilities={filteredFacilities}
            className="h-[280px] sm:h-[380px] md:h-[450px]"
          />
        </Card>
      )}

      {/* =========================
          HOSPITAL LIST
      ========================== */}

      {viewMode === 'LIST' && (

        <div className="space-y-2.5">

          {filteredFacilities.map((facility) => (

            <Card
              key={facility.id}
              className="border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md transition-all"
            >

              <CardContent className="p-3.5">

                <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                  {/* =========================
                      HOSPITAL NAME
                  ========================== */}

                  <div className="flex items-start gap-3 min-w-0 lg:w-[30%]">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">

                      <Building2 className="h-5 w-5" />

                    </div>

                    <div className="min-w-0">

                      <div className="flex items-center gap-1.5">

                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {facility.name}
                        </h3>

                        {facility.isVerified && (
                          <ShieldCheck
                            className="h-3.5 w-3.5 shrink-0 text-teal-600"
                            // title="Verified hospital"
                          />
                        )}

                      </div>

                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {getFacilityType(facility.type)}
                      </p>

                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">

                        <MapPin className="h-3 w-3 text-teal-600" />

                        <span>
                          {facility.distanceKm} km away
                        </span>

                        <span>•</span>

                        <span>
                          {facility.district}
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* =========================
                      STATUS
                  ========================== */}

                  <div className="lg:w-[14%]">

                    {facility.isOpen ? (

                      <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                        Open Now
                      </span>

                    ) : (

                      <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                        Closed
                      </span>

                    )}

                  </div>


                  {/* =========================
                      SERVICES
                  ========================== */}

                  <div className="lg:w-[20%] min-w-0">

                    <div className="flex items-center gap-1.5 mb-1">

                      <Stethoscope className="h-3.5 w-3.5 text-slate-500" />

                      <span className="text-[10px] font-semibold text-slate-500">
                        Services
                      </span>

                    </div>

                    <div className="flex flex-wrap gap-1">

                      {facility.specialties
                        .slice(0, 2)
                        .map((specialty) => (

                          <span
                            key={specialty}
                            className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-700"
                          >
                            {specialty}
                          </span>

                        ))}

                      {facility.specialties.length > 2 && (

                        <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
                          +{facility.specialties.length - 2}
                        </span>

                      )}

                    </div>

                  </div>


                  {/* =========================
                      SIMPLE DETAILS
                  ========================== */}

                  <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-5 lg:flex-1 py-1">

                    {/* Beds */}

                    <div className="flex items-center gap-2">

                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50">

                        <Bed className="h-3.5 w-3.5 text-teal-600" />

                      </div>

                      <div>

                        <p className="text-[9px] text-slate-400">
                          Beds
                        </p>

                        <p className="text-xs font-bold text-slate-800">
                          {facility.availableBeds} available
                        </p>

                      </div>

                    </div>


                    {/* Waiting */}

                    <div className="flex items-center gap-2">

                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50">

                        <Clock className="h-3.5 w-3.5 text-amber-600" />

                      </div>

                      <div>

                        <p className="text-[9px] text-slate-400">
                          Waiting
                        </p>

                        <p className="text-xs font-bold text-slate-800">
                          {facility.currentWaitTimeMinutes} min
                        </p>

                      </div>

                    </div>


                    {/* Emergency */}

                    <div className="flex items-center gap-2">

                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50">

                        <Phone className="h-3.5 w-3.5 text-red-500" />

                      </div>

                      <div>

                        <p className="text-[9px] text-slate-400">
                          Emergency
                        </p>

                        <p
                          className={`text-[10px] font-bold ${
                            facility.emergencyAvailable
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {facility.emergencyAvailable
                            ? 'Available'
                            : 'Not Available'}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* =========================
                      BUTTONS
                  ========================== */}

                  <div className="flex gap-2 lg:w-[190px]">

                    <Link
                      to={`/patient/facilities/${facility.id}`}
                      className="flex-1"
                    >

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-[11px]"
                      >
                        Details
                      </Button>

                    </Link>

                    <Link
                      to="/patient/tokens"
                      className="flex-1"
                    >

                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full h-8 text-[11px] bg-teal-700 hover:bg-teal-800"
                      >
                        Get Token
                      </Button>

                    </Link>

                  </div>

                </div>

              </CardContent>

            </Card>

          ))}

        </div>

      )}

      {/* =========================
          NO RESULTS
      ========================== */}

      {filteredFacilities.length === 0 && (

        <Card className="border-slate-200">

          <CardContent className="py-10 text-center">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">

              <Search className="h-5 w-5 text-slate-400" />

            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-800">
              No hospital found
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Try another hospital name or area.
            </p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setEmergencyOnly(false);
                setBedsOnly(false);
              }}
            >
              Show All Hospitals
            </Button>

          </CardContent>

        </Card>

      )}

      {/* =========================
          HELP
      ========================== */}

      <div className="flex items-center gap-2.5 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2.5">

        <MapPin className="h-4 w-4 shrink-0 text-teal-700" />

        <div>

          <p className="text-xs font-semibold text-teal-900">
            Looking for a hospital nearby?
          </p>

          <p className="text-[10px] text-teal-700">
            Use the map or search by hospital name or area.
          </p>

        </div>

      </div>

    </div>
  );
};