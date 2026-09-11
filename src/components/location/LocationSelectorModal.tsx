import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useLocationContext,
  GUJARAT_DISTRICTS,
  AVAILABLE_HOSPITALS,
  LocationFacility,
} from '@/contexts/LocationContext';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  Building2,
  Bed,
  AlertCircle,
} from 'lucide-react';

export const LocationSelectorModal: React.FC = () => {
  const {
    selectedDistrict,
    selectedFacility,
    isLocationModalOpen,
    closeLocationModal,
    setLocation,
    detectGpsLocation,
  } = useLocationContext();

  const [filterDistrict, setFilterDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsMessage, setGpsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter hospitals based on district chip and search query
  const filteredHospitals = AVAILABLE_HOSPITALS.filter((hospital) => {
    const matchesDistrict = filterDistrict === 'ALL' || hospital.district === filterDistrict;
    const matchesSearch =
      searchQuery.trim() === '' ||
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  const handleSelect = (hospital: LocationFacility) => {
    setLocation(hospital.district, hospital.name, hospital.id);
    closeLocationModal();
  };

  const handleGpsDetect = async () => {
    setIsDetectingGps(true);
    setGpsMessage(null);
    try {
      const result = await detectGpsLocation();
      if (result.success) {
        setGpsMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          closeLocationModal();
        }, 1200);
      } else {
        setGpsMessage({ type: 'error', text: result.message });
      }
    } finally {
      setIsDetectingGps(false);
    }
  };

  return (
    <Dialog open={isLocationModalOpen} onOpenChange={(open) => !open && closeLocationModal()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600/30 border border-teal-400/30 text-teal-300 shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                Change Healthcare Location
              </DialogTitle>
              <p className="text-xs text-slate-300 mt-0.5">
                Select your district and primary hospital across Gujarat Public Health Grid
              </p>
            </div>
          </div>

          {/* Quick GPS Button */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleGpsDetect}
              disabled={isDetectingGps}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Navigation className={`h-3.5 w-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Detecting Location...' : 'Use My Current GPS Location'}</span>
            </button>

            <span className="text-[11px] text-slate-400 text-center sm:text-right">
              Currently: <strong className="text-teal-300">{selectedDistrict}</strong> ({selectedFacility.split('&')[0].trim()})
            </span>
          </div>

          {gpsMessage && (
            <div
              className={`mt-2.5 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                gpsMessage.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
              }`}
            >
              {gpsMessage.type === 'success' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              )}
              <span>{gpsMessage.text}</span>
            </div>
          )}
        </div>

        {/* Search & District Filter Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search hospital name, city, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white text-xs"
            />
          </div>

          {/* District Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
            <button
              type="button"
              onClick={() => setFilterDistrict('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                filterDistrict === 'ALL'
                  ? 'bg-teal-700 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Districts ({AVAILABLE_HOSPITALS.length})
            </button>
            {GUJARAT_DISTRICTS.map((district) => (
              <button
                type="button"
                key={district}
                onClick={() => setFilterDistrict(district)}
                className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  filterDistrict === district
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {district}
              </button>
            ))}
          </div>
        </div>

        {/* Hospital List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          {filteredHospitals.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              No hospitals found matching "{searchQuery}".
            </div>
          ) : (
            filteredHospitals.map((hospital) => {
              const isSelected =
                selectedFacility === hospital.name ||
                (selectedDistrict === hospital.district && selectedFacility.includes(hospital.name.split(' ')[0]));

              return (
                <div
                  key={hospital.id}
                  onClick={() => handleSelect(hospital)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900">{hospital.name}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {hospital.typeBadge}
                      </span>
                      {hospital.emergency24x7 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          24x7 Casualty
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{hospital.address}</span>
                    </p>

                    {hospital.availableBeds !== undefined && (
                      <div className="flex items-center gap-3 pt-0.5 text-[11px]">
                        <span className="text-teal-700 font-semibold flex items-center gap-1">
                          <Bed className="h-3 w-3" /> {hospital.availableBeds} Available Beds
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">District: {hospital.district}</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-slate-300 hover:border-teal-500" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-slate-500">
            Selected: <strong className="text-slate-800">{selectedFacility}</strong>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeLocationModal}
            className="text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
