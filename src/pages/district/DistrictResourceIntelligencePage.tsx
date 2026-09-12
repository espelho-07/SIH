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
  SpecialistShortageItem,
  EquipmentGapItem,
  MedicineShortageItem,
  DiagnosticGapItem,
  EvidenceRecommendation,
  DistrictAiQueryResponse,
} from '@/types/intelligence';
import { DistrictIntelligenceMap } from '@/components/district/DistrictIntelligenceMap';
import {
  Radar,
  Building2,
  Stethoscope,
  FlaskConical,
  Pill,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  MapPin,
  RefreshCw,
  FileText,
  Bed,
  GitBranch,
  Filter,
  Check,
  Info,
  HelpCircle,
} from 'lucide-react';

export const DistrictResourceIntelligencePage: React.FC = () => {
  const { selectedDistrict } = useLocationContext();

  // Primary State
  const [timeRange, setTimeRange] = useState<'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS'>('TODAY');
  const [activeTab, setActiveTab] = useState<'SPECIALIST' | 'DIAGNOSTIC' | 'MEDICINE' | 'EQUIPMENT'>('SPECIALIST');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('area_peth_w3');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('fac_civil_01');

  // Query Assistant State
  const [userQuery, setUserQuery] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<DistrictAiQueryResponse | null>(null);

  // Data Loading State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Datasets
  const [summary, setSummary] = useState<DistrictHealthSummary | null>(null);
  const [areas, setAreas] = useState<AreaIntelligenceProfile[]>([]);
  const [facilities, setFacilities] = useState<FacilityGapProfile[]>([]);
  const [specialistGaps, setSpecialistGaps] = useState<SpecialistShortageItem[]>([]);
  const [equipmentGaps, setEquipmentGaps] = useState<EquipmentGapItem[]>([]);
  const [medicineShortages, setMedicineShortages] = useState<MedicineShortageItem[]>([]);
  const [diagnosticGaps, setDiagnosticGaps] = useState<DiagnosticGapItem[]>([]);
  const [recommendations, setRecommendations] = useState<EvidenceRecommendation[]>([]);

  // Load authoritative data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, areasRes, facsRes, specRes, equipRes, medRes, diagRes, recRes] = await Promise.all([
        intelligenceApi.getSummary(selectedDistrict, timeRange),
        intelligenceApi.getAreas(selectedDistrict),
        intelligenceApi.getFacilities(selectedDistrict),
        intelligenceApi.getSpecialistGaps(selectedDistrict),
        intelligenceApi.getEquipmentGaps(selectedDistrict),
        intelligenceApi.getMedicineShortages(selectedDistrict),
        intelligenceApi.getDiagnosticGaps(selectedDistrict),
        intelligenceApi.getRecommendations(selectedDistrict),
      ]);

      setSummary(sumRes.data);
      setAreas(areasRes.data);
      setFacilities(facsRes.data);
      setSpecialistGaps(specRes.data);
      setEquipmentGaps(equipRes.data);
      setMedicineShortages(medRes.data);
      setDiagnosticGaps(diagRes.data);
      setRecommendations(recRes.data);

      // Default AI query seed
      const defaultAi = await intelligenceApi.queryAi('Overview of critical shortages and service gaps', selectedDistrict);
      setAiResponse(defaultAi.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load district health intelligence telemetry. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDistrict, timeRange]);

  // Derived active selections using useMemo (vercel-react-best-practices)
  const activeArea = useMemo(() => {
    return areas.find((a) => a.id === selectedAreaId) || areas[0] || null;
  }, [areas, selectedAreaId]);

  const activeFacility = useMemo(() => {
    return facilities.find((f) => f.facilityId === selectedFacilityId) || facilities[0] || null;
  }, [facilities, selectedFacilityId]);

  // Handle AI Query
  const handleRunAiQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setUserQuery(queryText);
    setIsQuerying(true);
    try {
      const res = await intelligenceApi.queryAi(queryText, selectedDistrict);
      setAiResponse(res.data);
    } catch {
      // Graceful fallback
    } finally {
      setIsQuerying(false);
    }
  };

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

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-16">
      {/* 1. Header Section */}
      <PageHeader
        title="Health Resource Intelligence"
        subtitle={`Real district healthcare telemetry to identify critical service gaps, specialist deficits, and underserved areas across ${selectedDistrict} District.`}
        breadcrumbs={[
          { label: 'District Admin', to: '/district' },
          { label: 'Public Health & Insights', to: '/district' },
          { label: 'Resource Intelligence' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Filter Chips */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {(['TODAY', 'LAST_7_DAYS', 'LAST_30_DAYS'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    timeRange === range
                      ? 'bg-white text-teal-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range === 'TODAY' ? 'Today' : range === 'LAST_7_DAYS' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <FileText className="h-4 w-4 text-slate-500" />
              <span>Export Briefing</span>
            </Button>
          </div>
        }
      />

      {/* 2. Top Banner: Governance Standard & Freshness */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-4 sm:p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-800/80 border border-teal-600/60 px-2.5 py-0.5 text-[10px] font-bold text-teal-100 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {summary?.telemetryFreshness || 'Telemetry Connected'}
            </span>
            <span className="text-[11px] text-teal-200">
              Authority: Chief District Health Officer ({selectedDistrict})
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            District Service Gap & Resource Decision Support
          </h2>
          <p className="text-xs text-teal-100/90 leading-relaxed max-w-3xl">
            <strong>Decision-Support Notice:</strong> Synthesizes real patient demand, frontline ASHA cohorts, and facility capacity. All recommendations are advisory for human administrative review and do not alter staffing or procurement automatically.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Button
            size="sm"
            onClick={fetchData}
            variant="outline"
            className="border-teal-500/60 text-white bg-teal-900/50 hover:bg-teal-800 gap-1 text-xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* 3. Top-Level District Summary (6 Interactive Filter Metric Pills - Section 4) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            District Critical Summary Telemetry
          </h3>
          <span className="text-[11px] text-slate-400">Click any metric to focus relevant view</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Areas Needing Attention */}
          <Card
            onClick={() => {
              const elem = document.getElementById('section-priority-areas');
              elem?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-3.5 bg-white border-rose-200 hover:border-rose-400 transition-all cursor-pointer shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Priority Areas</span>
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {summary?.areasNeedingAttentionCount ?? 3}
            </p>
            <span className="text-[10px] text-slate-500 block truncate">Villages need attention</span>
          </Card>

          {/* Facilities with Critical Gaps */}
          <Card
            onClick={() => {
              const elem = document.getElementById('section-facilities');
              elem?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-3.5 bg-white border-amber-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Facilities Alert</span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Building2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {summary?.facilitiesWithCriticalGapsCount ?? 2}
            </p>
            <span className="text-[10px] text-slate-500 block truncate">Facilities critical gaps</span>
          </Card>

          {/* Specialist Gaps */}
          <Card
            onClick={() => {
              setActiveTab('SPECIALIST');
              const elem = document.getElementById('section-specific-gaps');
              elem?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-3.5 bg-white border-slate-200 hover:border-teal-400 transition-all cursor-pointer shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Specialist Gaps</span>
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <Stethoscope className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {summary?.specialistGapsCount ?? 3}
            </p>
            <span className="text-[10px] text-slate-500 block truncate">Deficit specialties</span>
          </Card>

          {/* Diagnostic Gaps */}
          <Card
            onClick={() => {
              setActiveTab('DIAGNOSTIC');
              const elem = document.getElementById('section-specific-gaps');
              elem?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-3.5 bg-white border-slate-200 hover:border-teal-400 transition-all cursor-pointer shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Diagnostics</span>
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                <FlaskConical className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {summary?.diagnosticGapsCount ?? 2}
            </p>
            <span className="text-[10px] text-slate-500 block truncate">High volume / delayed</span>
          </Card>

          {/* Medicine Shortages */}
          <Card
            onClick={() => {
              setActiveTab('MEDICINE');
              const elem = document.getElementById('section-specific-gaps');
              elem?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-3.5 bg-white border-slate-200 hover:border-teal-400 transition-all cursor-pointer shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Medicines</span>
              <div className="p-1.5 rounded-lg bg-pink-50 text-pink-700">
                <Pill className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {summary?.medicineShortagesCount ?? 3}
            </p>
            <span className="text-[10px] text-slate-500 block truncate">Low stock items</span>
          </Card>

          {/* Equipment Gaps */}
          <Card
            onClick={() => {
              setActiveTab('EQUIPMENT');
              const elem = document.getElementById('section-specific-gaps');
              elem?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-3.5 bg-white border-slate-200 hover:border-teal-400 transition-all cursor-pointer shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Equipment</span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Wrench className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {summary?.equipmentGapsCount ?? 2}
            </p>
            <span className="text-[10px] text-slate-500 block truncate">Maintenance / missing</span>
          </Card>
        </div>
      </div>

      {/* 4. Natural Language Query Box — Grounded District AI Query (Section 17) */}
      <Card className="p-4 sm:p-5 bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">District Intelligence Assistant</h3>
              <p className="text-xs text-slate-500">Ask operational questions grounded strictly in authoritative district records</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Check className="h-3 w-3" /> Grounded In Real Data
          </span>
        </div>

        {/* Quick Query Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            'Which areas have the highest referral load?',
            'Which facilities have specialist shortages?',
            'Where are diagnostic services unavailable?',
            'Which facilities have critical medicine shortages?',
            'Which facility is receiving the most referrals?',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleRunAiQuery(chip)}
              className="text-[11px] font-semibold bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-slate-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Free-text input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunAiQuery(userQuery);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ask about district demand, shortages, bed bottlenecks, or referral dependency..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <Button
            type="submit"
            disabled={isQuerying || !userQuery.trim()}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs px-4 cursor-pointer"
          >
            {isQuerying ? 'Querying...' : 'Ask'}
          </Button>
        </form>

        {/* AI Answer Display */}
        {aiResponse && (
          <div className="mt-3 rounded-xl bg-teal-50/50 border border-teal-200/80 p-3.5 text-xs space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                  Answer • {aiResponse.relevantFacilityOrArea}
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {aiResponse.answer}
                </p>
              </div>
            </div>

            {/* Supporting Data Grid */}
            {aiResponse.supportingData.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-teal-100">
                {aiResponse.supportingData.map((d, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white border border-teal-100">
                    <span className="text-[10px] text-slate-500 block truncate">{d.label}</span>
                    <span className="text-xs font-bold text-teal-950 truncate block mt-0.5">{d.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-teal-100/60">
              <span>Source: {aiResponse.provenance}</span>
              <span>{aiResponse.dataFreshness}</span>
            </div>
          </div>
        )}
      </Card>

      {/* 5. Geographic & Village Intelligence Grid (Section 5 & 6) */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Geographic & Area Intelligence Mapping</h3>
          <p className="text-xs text-slate-500">
            Interactive district spatial overview showing village clusters, serving public facilities, and outward patient referral dependency vectors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Interactive GIS Map */}
          <div className="lg:col-span-7 space-y-2">
            <DistrictIntelligenceMap
              areas={areas}
              facilities={facilities}
              selectedAreaId={selectedAreaId}
              onSelectArea={(area) => setSelectedAreaId(area.id)}
              selectedFacilityId={selectedFacilityId}
              onSelectFacility={(fac) => setSelectedFacilityId(fac.facilityId)}
              className="h-[520px]"
            />

            {/* Quick Area Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Areas:</span>
              {areas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAreaId(a.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedAreaId === a.id
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {a.name.split('(')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Village / Area Profile Card (Section 6) */}
          <div className="lg:col-span-5">
            {activeArea ? (
              <Card className="p-4 sm:p-5 bg-white border-slate-200 shadow-xs space-y-4">
                {/* Area Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {activeArea.block} Block
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          activeArea.status === 'ATTENTION_REQUIRED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {activeArea.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">
                      {activeArea.name}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Est. Population: {activeArea.populationEstimate.toLocaleString()} citizens
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Gap Index</span>
                    <span className="text-2xl font-black text-rose-600 leading-none">
                      {activeArea.priorityScore}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ 100</span>
                  </div>
                </div>

                {/* Serving Public Facilities */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                    Public Facilities Serving This Area
                  </span>
                  <div className="space-y-1">
                    {activeArea.servingFacilities.map((fac) => (
                      <div
                        key={fac.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-teal-700" />
                          <span className="font-semibold text-slate-800">{fac.name}</span>
                          {fac.isNearest && (
                            <span className="text-[10px] rounded-sm bg-teal-100 text-teal-800 px-1 font-bold">
                              Nearest
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 font-medium">{fac.distanceKm} km</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Availability Matrix */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                    Local Service Availability Matrix
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { label: 'General Care', val: activeArea.serviceAvailability.generalCare },
                      { label: 'Specialist Care', val: activeArea.serviceAvailability.specialistCare },
                      { label: 'Emergency 24x7', val: activeArea.serviceAvailability.emergencyCasualty },
                      { label: 'Diagnostics', val: activeArea.serviceAvailability.diagnostics },
                      { label: 'Pharmacy', val: activeArea.serviceAvailability.pharmacyMeds },
                      { label: 'Maternal ANC', val: activeArea.serviceAvailability.maternalCare },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-2 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between"
                      >
                        <span className="text-[10px] text-slate-600 font-medium truncate">{item.label}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            item.val === 'AVAILABLE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.val === 'LIMITED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Healthcare Demand & Case Categories */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                      Case Demand Patterns
                    </span>
                    <span className="text-[10px] text-slate-400">Aggregated & Privacy-Safe</span>
                  </div>
                  <div className="space-y-1">
                    {activeArea.demand.topCaseCategories.map((c, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-800 font-medium truncate">{c.category}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{c.recordedCases} cases</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                              c.isProjected
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {c.isProjected ? 'MODELED' : 'RECORDED'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Referral Dependency & Outward Ratio */}
                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5 text-rose-700" />
                      Referral Dependency: {Math.round(activeArea.referralDependency.outwardReferralRatio * 100)}% Outward
                    </span>
                    <span className="text-[10px] text-rose-700 font-bold">
                      {activeArea.demand.referralVolume30d} referrals / mo
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-800">
                    Patients primarily transferred {activeArea.referralDependency.averageTransferDistanceKm} km to{' '}
                    <strong>{activeArea.referralDependency.primaryDestinationFacilityName}</strong> for{' '}
                    {activeArea.referralDependency.dominantReferralSpecialties.join(', ')}.
                  </p>
                </div>

                {/* Suggested Administrative Review */}
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs space-y-1">
                  <span className="font-bold text-teal-950 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-teal-700" /> Administrative Review Consideration
                  </span>
                  <p className="text-[11px] text-teal-900 leading-relaxed">
                    {activeArea.suggestedAdministrativeReview}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Select an area on the map to inspect its health demand profile.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Facility Demand vs Capacity Matrix (Section 8) */}
      <div id="section-facilities" className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Facility Demand vs Capacity Matrix</h3>
          <p className="text-xs text-slate-500">
            Authoritative breakdown of patient volume, hospital beds, active physicians, and verified resource bottlenecks across public facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {facilities.map((fac) => (
            <Card
              key={fac.facilityId}
              onClick={() => setSelectedFacilityId(fac.facilityId)}
              className={`p-4 transition-all cursor-pointer shadow-xs hover:shadow-sm space-y-3 ${
                selectedFacilityId === fac.facilityId
                  ? 'border-teal-600 ring-2 ring-teal-600/20 bg-white'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {fac.facilityType.replace(/_/g, ' ')}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5" title={fac.facilityName}>
                    {fac.facilityName}
                  </h4>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0 ${
                    fac.overallGapSeverity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800'
                      : fac.overallGapSeverity === 'MODERATE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {fac.overallGapSeverity} GAP
                </span>
              </div>

              {/* Demand vs Capacity Ratios */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 block">Daily OPD</span>
                  <span className="font-bold text-slate-800">{fac.demandMetrics.dailyOpdVolume}</span>
                  <span className="text-[10px] text-slate-400"> / {fac.demandMetrics.dailyOpdCapacity} max</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 block">Bed Occupancy</span>
                  <span className="font-bold text-slate-800">{fac.capacityMetrics.bedOccupancyRate}%</span>
                  <span className="text-[10px] text-slate-400"> ({fac.capacityMetrics.availableBeds} free)</span>
                </div>
              </div>

              {/* Doctors & ICU */}
              <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                <span>Physicians: <strong>{fac.capacityMetrics.activeDoctorsCount}</strong></span>
                <span>ICU Free: <strong className={fac.capacityMetrics.icuBedsAvailable <= 1 && fac.capacityMetrics.icuBedsTotal > 0 ? 'text-rose-600' : 'text-slate-900'}>
                  {fac.capacityMetrics.icuBedsAvailable} / {fac.capacityMetrics.icuBedsTotal}
                </strong></span>
              </div>

              {/* Key Identified Gap Pill */}
              {fac.identifiedGaps.length > 0 ? (
                <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-200 text-[11px] text-rose-900 space-y-0.5">
                  <span className="font-bold block truncate">⚠ {fac.identifiedGaps[0].title}</span>
                  <p className="text-[10px] text-rose-700 truncate">{fac.identifiedGaps[0].evidence}</p>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-emerald-50 text-[11px] text-emerald-800">
                  ✓ Operational parameters within standard thresholds
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* 7. Specialized Intelligence Drill-Downs (Sections 9, 10, 11, 12) */}
      <div id="section-specific-gaps" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Specialized Capacity Gap Intelligence</h3>
            <p className="text-xs text-slate-500">
              Verified clinical deficit breakdowns across Doctors, Diagnostics, Medicines, and Equipment.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {[
              { id: 'SPECIALIST', label: 'Specialist Deficits', count: specialistGaps.length, icon: Stethoscope },
              { id: 'DIAGNOSTIC', label: 'Diagnostic Gaps', count: diagnosticGaps.length, icon: FlaskConical },
              { id: 'MEDICINE', label: 'Medicine Shortages', count: medicineShortages.length, icon: Pill },
              { id: 'EQUIPMENT', label: 'Equipment Status', count: equipmentGaps.length, icon: Wrench },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'SPECIALIST' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {specialistGaps.map((gap) => (
              <Card key={gap.id} className="p-4 bg-white border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specialty</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{gap.specialty}</h4>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      gap.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : gap.severity === 'MODERATE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {gap.severity}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Consultation Deficit</span>
                    <span className="text-lg font-black text-slate-900">
                      {gap.deficitConsultations > 0 ? `+${gap.deficitConsultations}` : gap.deficitConsultations}
                    </span>
                    <span className="text-[10px] text-slate-500"> / day</span>
                  </div>
                  <div className="text-right text-[11px] text-slate-600">
                    <div>Doctors: <strong>{gap.currentDoctorsCount}</strong></div>
                    <div>Capacity: <strong>{gap.availableCapacityConsultations}/d</strong></div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {gap.evidenceText}
                </p>

                <div className="p-2 rounded-lg bg-teal-50 border border-teal-100 text-[11px] text-teal-900">
                  <strong>Review Option: </strong> {gap.administrativeReviewOption}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'DIAGNOSTIC' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {diagnosticGaps.map((diag) => (
              <Card key={diag.id} className="p-4 bg-white border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{diag.category}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{diag.testName}</h4>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      diag.status === 'UNAVAILABLE_LOCALLY'
                        ? 'bg-rose-100 text-rose-800'
                        : diag.status === 'HIGH_VOLUME'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {diag.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 text-xs flex items-center justify-between">
                  <span>Facility: <strong>{diag.affectedFacilityName.split('(')[0]}</strong></span>
                  <span>Demand: <strong>{diag.dailyDemandVolume}/day</strong></span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {diag.evidenceText}
                </p>

                <div className="p-2 rounded-lg bg-teal-50 border border-teal-100 text-[11px] text-teal-900">
                  <strong>Action for Review: </strong> {diag.suggestedActionForReview}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'MEDICINE' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {medicineShortages.map((med) => (
              <Card key={med.id} className="p-4 bg-white border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{med.category}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{med.medicineName}</h4>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-800">
                    {med.severity.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 text-xs grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Available Stock</span>
                    <span className="font-bold text-rose-600">{med.availableStock} {med.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Min Threshold</span>
                    <span className="font-bold text-slate-800">{med.minimumThreshold} {med.unit}</span>
                  </div>
                </div>

                {med.nearbyAvailableFacility && (
                  <div className="p-2 rounded-lg bg-emerald-50 text-[11px] text-emerald-900">
                    <strong>Redistribution Source: </strong> {med.nearbyAvailableFacility.facilityName} ({med.nearbyAvailableFacility.availableStock} in stock)
                  </div>
                )}

                <div className="p-2 rounded-lg bg-teal-50 border border-teal-100 text-[11px] text-teal-900">
                  <strong>Action for Review: </strong> {med.suggestedActionForReview}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'EQUIPMENT' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {equipmentGaps.map((eq) => (
              <Card key={eq.id} className="p-4 bg-white border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{eq.category}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{eq.equipmentName}</h4>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      eq.status === 'MAINTENANCE'
                        ? 'bg-rose-100 text-rose-800'
                        : eq.status === 'OFFLINE'
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {eq.status}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 text-xs flex items-center justify-between">
                  <span>Facility: <strong>{eq.facilityName.split('(')[0]}</strong></span>
                  <span>Operational: <strong>{eq.operationalQuantity} / {eq.totalQuantity}</strong></span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {eq.operationalEffect}
                </p>

                <div className="p-2 rounded-lg bg-teal-50 border border-teal-100 text-[11px] text-teal-900">
                  <strong>Action for Review: </strong> {eq.suggestedActionForReview}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 8. Priority Areas ("Areas Needing Attention" - Section 14) */}
      <div id="section-priority-areas" className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Priority Geographic Areas Needing Attention</h3>
          <p className="text-xs text-slate-500">
            Concise operational breakdown answering WHERE, WHAT, WHY, WHAT IS AFFECTED, and WHAT CAN BE REVIEWED.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {areas
            .filter((a) => a.status === 'ATTENTION_REQUIRED')
            .map((area) => (
              <Card key={area.id} className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">{area.block} Block</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{area.name.split('(')[0]}</h4>
                  </div>
                  <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-black">
                    Score: {area.priorityScore}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <strong className="text-slate-900">WHAT: </strong>
                    <span className="text-slate-600">{area.demand.mostRequestedServices.slice(0, 2).join(' & ')}</span>
                  </div>
                  <div>
                    <strong className="text-slate-900">WHY: </strong>
                    <span className="text-slate-600">{area.priorityReasons[0]}</span>
                  </div>
                  <div>
                    <strong className="text-slate-900">AFFECTED: </strong>
                    <span className="text-slate-600">
                      {Math.round(area.referralDependency.outwardReferralRatio * 100)}% cases sent {area.referralDependency.averageTransferDistanceKm} km away
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-900 text-[11px] leading-relaxed">
                    <strong>REVIEW: </strong> {area.suggestedAdministrativeReview}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedAreaId(area.id);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold gap-1 text-teal-800 hover:bg-teal-50 cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5 text-teal-700" />
                  <span>Review Area On Map</span>
                </Button>
              </Card>
            ))}
        </div>
      </div>

      {/* 9. Capacity Planning — Evidence-Backed Recommendations (Section 15) */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Capacity Planning — Review Recommendations</h3>
          <p className="text-xs text-slate-500">
            Administrative decision support based on recorded clinical demand, facility saturation, and supply telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="p-4 sm:p-5 bg-white border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {rec.category.replace(/_/g, ' ')} • {rec.targetFacilityOrArea}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{rec.title}</h4>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0 ${
                    rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {rec.priority} PRIORITY
                </span>
              </div>

              {/* Why This is Flagged */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-800 block text-[11px]">Why this was flagged:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                  {rec.whyFlagged.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* Evidence Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                {rec.evidenceMetrics.map((m, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block truncate">{m.label}</span>
                    <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Administrative Action */}
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-xs text-teal-950 space-y-1">
                <strong>Action for Human Review:</strong>
                <p className="text-[11px] text-teal-900 leading-relaxed">{rec.suggestedActionForReview}</p>
              </div>

              <span className="text-[10px] text-slate-400 block italic">
                {rec.disclaimer}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
