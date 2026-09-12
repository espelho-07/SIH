import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocationContext } from '@/contexts/LocationContext';
import { intelligenceApi } from '@/api/intelligenceApi';
import {
  DistrictHealthSummary,
  AreaIntelligenceProfile,
  FacilityGapProfile,
  HospitalDoctorRequirement,
  UnusedResourceItem,
} from '@/types/intelligence';
import { DistrictIntelligenceMap } from '@/components/district/DistrictIntelligenceMap';
import {
  Building2,
  Stethoscope,
  Wrench,
  AlertTriangle,
  TrendingUp,
  MapPin,
  RefreshCw,
  Bed,
  Map,
  Package,
  Activity,
  Sparkles,
} from 'lucide-react';

export const DistrictResourceIntelligencePage: React.FC = () => {
  const { selectedDistrict } = useLocationContext();

  // Active View Filter & Toggles
  const [activeSection, setActiveSection] = useState<'ALL' | 'AREAS' | 'DOCTORS' | 'UNUSED'>('ALL');
  const [timeRange, setTimeRange] = useState<'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS'>('TODAY');
  const [showMap, setShowMap] = useState<boolean>(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('area_sec_24');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('fac_civil_01');

  // Datasets
  const [summary, setSummary] = useState<DistrictHealthSummary | null>(null);
  const [areas, setAreas] = useState<AreaIntelligenceProfile[]>([]);
  const [facilities, setFacilities] = useState<FacilityGapProfile[]>([]);
  const [doctorRequirements, setDoctorRequirements] = useState<HospitalDoctorRequirement[]>([]);
  const [unusedResources, setUnusedResources] = useState<UnusedResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load authoritative data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, areasRes, facsRes, docsRes, unusedRes] = await Promise.all([
        intelligenceApi.getSummary(selectedDistrict, timeRange),
        intelligenceApi.getAreas(selectedDistrict),
        intelligenceApi.getFacilities(selectedDistrict),
        intelligenceApi.getDoctorRequirements(selectedDistrict),
        intelligenceApi.getUnusedResources(selectedDistrict),
      ]);

      setSummary(sumRes.data);
      setAreas(areasRes.data);
      setFacilities(facsRes.data);
      setDoctorRequirements(docsRes.data);
      setUnusedResources(unusedRes.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load district health intelligence telemetry. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDistrict, timeRange]);

  // Derived active selections using useMemo
  const activeArea = useMemo(() => {
    return areas.find((a) => a.id === selectedAreaId) || areas[0] || null;
  }, [areas, selectedAreaId]);


  if (isLoading && !summary) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        <div className="h-10 bg-slate-200 rounded-xl animate-pulse w-72" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 inline-block">
          <AlertTriangle className="h-8 w-8 mx-auto" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">District Intelligence Telemetry Unavailable</h3>
        <p className="text-xs text-slate-600">{error}</p>
        <Button onClick={fetchData} className="gap-2 bg-teal-700 hover:bg-teal-800 text-white">
          <RefreshCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </Button>
      </div>
    );
  }

  // Count metrics for quick badge summaries
  const totalDoctorsNeeded = doctorRequirements.reduce(
    (acc, h) => acc + h.requirements.reduce((rAcc, r) => rAcc + r.doctorsNeeded, 0),
    0
  );
  const totalUnusedItems = unusedResources.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* 1. Clean Minimal Header (No bulky disclaimer banner) */}
      <PageHeader
        title="District Resource Intelligence"
        subtitle={`Live area disease predictions, hospital doctor requirements, and underutilized public resources across ${selectedDistrict} District.`}
        breadcrumbs={[
          { label: 'District Admin', to: '/district' },
          { label: 'Public Health & Insights', to: '/district' },
          { label: 'Resource Intelligence' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {(['TODAY', 'LAST_7_DAYS', 'LAST_30_DAYS'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    timeRange === range
                      ? 'bg-white text-teal-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range === 'TODAY' ? 'Today' : range === 'LAST_7_DAYS' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>

            {/* Map Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className={`gap-1.5 text-xs font-semibold cursor-pointer ${
                showMap ? 'bg-teal-50 border-teal-300 text-teal-800' : 'text-slate-700'
              }`}
            >
              <Map className="h-4 w-4 text-teal-600" />
              <span>{showMap ? 'Hide Map' : 'View District Map'}</span>
            </Button>

            {/* Refresh Sync */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="gap-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              <span>Sync</span>
            </Button>
          </div>
        }
      />

      {/* 2. Sleek 3-Step Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Step 1: Area Predictions */}
        <div
          onClick={() => setActiveSection(activeSection === 'AREAS' ? 'ALL' : 'AREAS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeSection === 'AREAS'
              ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-100/80 text-teal-800">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Areas & Disease</span>
            </div>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {areas.length} Areas
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2">Area-Wise Disease Predictions</p>
          <p className="text-xs text-slate-500 mt-0.5">Which disease is surging in each village/sector</p>
        </div>

        {/* Step 2: Doctors Needed */}
        <div
          onClick={() => setActiveSection(activeSection === 'DOCTORS' ? 'ALL' : 'DOCTORS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeSection === 'DOCTORS'
              ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-100/80 text-rose-800">
                <Stethoscope className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Doctors Needed</span>
            </div>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              +{totalDoctorsNeeded} Required
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2">Hospital-Wise Doctor Shortages</p>
          <p className="text-xs text-slate-500 mt-0.5">Specialty & field doctors required per hospital</p>
        </div>

        {/* Step 3: Unused Items */}
        <div
          onClick={() => setActiveSection(activeSection === 'UNUSED' ? 'ALL' : 'UNUSED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeSection === 'UNUSED'
              ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100/80 text-amber-800">
                <Package className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Unused Resources</span>
            </div>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {totalUnusedItems} Idle / Low Use
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2">Unused & Underutilized Items</p>
          <p className="text-xs text-slate-500 mt-0.5">Idle equipment, vacant beds & surplus supplies</p>
        </div>
      </div>

      {/* 3. Collapsible Map Section (Toggled only when requested) */}
      {showMap && (
        <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">District Geospatial Overview</h3>
            </div>
            <span className="text-xs text-slate-500">Click any marker or area to focus</span>
          </div>

          <DistrictIntelligenceMap
            areas={areas}
            facilities={facilities}
            selectedAreaId={selectedAreaId}
            onSelectArea={(area) => setSelectedAreaId(area.id)}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={(fac) => setSelectedFacilityId(fac.facilityId)}
            className="h-[380px]"
          />
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: AREA-WISE DISEASE PREDICTION                                   */}
      {/* ========================================================================= */}
      {(activeSection === 'ALL' || activeSection === 'AREAS') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs">1</div>
              <h3 className="text-base font-bold text-slate-900">Area-Wise Disease Predictions & Health Patterns</h3>
            </div>
            <span className="text-xs text-slate-500">Where demand is highest & what diseases are spreading</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areas.map((area) => {
              const topDisease = area.demand.topCaseCategories[0];
              const secondDisease = area.demand.topCaseCategories[1];
              const isSurge = topDisease?.trendPercentage && topDisease.trendPercentage > 15;

              return (
                <Card
                  key={area.id}
                  className="p-5 bg-white border-slate-200 shadow-xs hover:border-teal-300 transition-all space-y-3.5"
                >
                  {/* Area Title & Severity Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {area.block} Block
                        </span>
                        <span className="text-[11px] text-slate-500">• Pop: {area.populationEstimate.toLocaleString()}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{area.name}</h4>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isSurge || area.priorityScore > 80
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isSurge ? '🚨 OUTBREAK SURGE' : '⚠️ HIGH DEMAND'}
                    </span>
                  </div>

                  {/* Disease in that area (Primary Highlight) */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                      Common Diseases & Case Load in this Area:
                    </span>

                    <div className="space-y-1.5">
                      {topDisease && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-teal-600" />
                            {topDisease.category}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{topDisease.recordedCases} cases</span>
                            {topDisease.trendPercentage !== undefined && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                  topDisease.trendPercentage > 0
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {topDisease.trendPercentage > 0 ? `+${topDisease.trendPercentage}%` : `${topDisease.trendPercentage}%`}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {secondDisease && (
                        <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                          <span className="flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-slate-400" />
                            {secondDisease.category}
                          </span>
                          <span className="font-semibold">{secondDisease.recordedCases} cases</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prediction & Outbreak Alert */}
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/80 text-xs text-teal-950">
                    <TrendingUp className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-teal-900">Health Prediction: </strong>
                      <span>
                        {area.id === 'area_sec_24'
                          ? 'Dengue Serotype-2 surge observed; expect +35 acute fever cases in next 48h. Platelet monitoring demand critical.'
                          : area.id === 'area_peth_w3'
                          ? 'Maternal anemia cases elevated; 100% of prenatal ultrasound scans forced to travel 6.8 km to Civil Hospital.'
                          : area.id === 'area_peth_w1'
                          ? 'High diabetic foot complications; delayed clinical presentation due to lack of local HbA1c testing.'
                          : 'Emergency maternity & agricultural trauma cases rising; delayed transit to district tertiary hospital.'}
                      </span>
                    </div>
                  </div>

                  {/* Serving Public Facility & Travel Burden */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        Serving Hospital:{' '}
                        <strong>{area.servingFacilities[0]?.name.split('(')[0]}</strong>
                        {area.servingFacilities[1] && ` & ${area.servingFacilities[1].name.split('(')[0]}`}
                      </span>
                    </div>

                    <span className="font-bold text-rose-700 text-[11px]">
                      {Math.round(area.referralDependency.outwardReferralRatio * 100)}% referred out ({area.referralDependency.averageTransferDistanceKm} km)
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: HOSPITAL-WISE DOCTORS NEEDED                                   */}
      {/* ========================================================================= */}
      {(activeSection === 'ALL' || activeSection === 'DOCTORS') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs">2</div>
              <h3 className="text-base font-bold text-slate-900">Hospital-Wise Doctors Needed (Field & Specialty Gaps)</h3>
            </div>
            <span className="text-xs text-slate-500">Exactly which doctors are needed at each public hospital</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {doctorRequirements.map((hospital) => (
              <Card
                key={hospital.facilityId}
                className="p-5 bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3.5"
              >
                {/* Hospital Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{hospital.facilityName}</h4>
                      <span className="text-[11px] text-slate-500 font-medium">{hospital.facilityType}</span>
                    </div>
                  </div>

                  <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 text-xs font-bold">
                    {hospital.requirements.reduce((acc, r) => acc + r.doctorsNeeded, 0)} Doctors Needed
                  </span>
                </div>

                {/* Requirements Breakdown Table / List */}
                <div className="space-y-2.5">
                  {hospital.requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{req.specialty}</span>
                          <span
                            className={`rounded-md px-1.5 py-0.2 text-[10px] font-black ${
                              req.urgency === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : req.urgency === 'HIGH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {req.urgency}
                          </span>
                        </div>

                        <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                          +{req.doctorsNeeded} {req.doctorsNeeded > 1 ? 'Doctors' : 'Doctor'} Needed
                        </span>
                      </div>

                      {/* Current Status vs Backlog */}
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>
                          Current On Duty: <strong>{req.currentDoctors}</strong>
                        </span>
                        <span>
                          Patient Backlog: <strong className="text-slate-900">{req.patientBacklog} patients/day</strong>
                        </span>
                        {req.avgWaitDays && (
                          <span>
                            Wait Time: <strong className="text-slate-900">{req.avgWaitDays} days</strong>
                          </span>
                        )}
                      </div>

                      {/* Reason */}
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                        <strong>Reason: </strong> {req.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: UNUSED & UNDERUTILIZED RESOURCES (KONSI CHIZE UNUSED HAIN)      */}
      {/* ========================================================================= */}
      {(activeSection === 'ALL' || activeSection === 'UNUSED') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">3</div>
              <h3 className="text-base font-bold text-slate-900">Unused & Underutilized Resources (Konsi Chize Unused Hain)</h3>
            </div>
            <span className="text-xs text-slate-500">Idle machines, vacant beds, & surplus stock that can solve shortages</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unusedResources.map((item) => {
              const isOffline = item.currentStatus === 'OFFLINE_MAINTENANCE';
              const isIdle = item.currentStatus === 'IDLE';
              const isLowUse = item.currentStatus === 'LOW_UTILIZATION';

              return (
                <Card
                  key={item.id}
                  className="p-4 bg-white border-slate-200 shadow-xs hover:border-amber-300 transition-all space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {item.category} • {item.facilityName.split('(')[0]}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">{item.resourceName}</h4>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0 ${
                        isOffline
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isIdle
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isLowUse
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {item.currentStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Quantity & Utilization Metric */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Idle Capacity / Quantity</span>
                      <span className="font-bold text-slate-900">{item.idleQuantity}</span>
                    </div>
                    {item.utilizationRate !== undefined && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Current Utilization</span>
                        <span className={`font-bold ${item.utilizationRate < 25 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {item.utilizationRate}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Why it is unused */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-slate-700 block">Why it is unused / idle:</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.impactOrCause}</p>
                  </div>

                  {/* Optimization Opportunity / Action */}
                  <div className="p-2.5 rounded-xl bg-teal-50/80 border border-teal-200 text-xs text-teal-950 space-y-1">
                    <strong className="flex items-center gap-1 text-teal-900 text-[11px]">
                      <Sparkles className="h-3.5 w-3.5 text-teal-700" />
                      Optimization Opportunity:
                    </strong>
                    <p className="text-[11px] text-teal-900 leading-relaxed">{item.opportunityRecommendation}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

