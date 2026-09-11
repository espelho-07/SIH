import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/BottomSheet';
import { MapView } from '@/components/map/MapView';
import { INITIAL_FACILITIES } from '@/mock/mockData';
import { Facility } from '@/types/facility';
import { Building2, Navigation, Phone, ShieldCheck, Bed, Stethoscope } from 'lucide-react';

export const DistrictMapView: React.FC = () => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader
        title="District Health GIS Intelligence Map"
        subtitle="Geospatial distribution of Gandhinagar healthcare facilities, live bed occupancy, and vector surge surveillance clusters."
        breadcrumbs={[{ label: 'District Admin', to: '/district' }, { label: 'GIS Map' }]}
      />

      <div className="relative">
        <MapView
          facilities={INITIAL_FACILITIES}
          selectedFacilityId={selectedFacility?.id}
          onSelectFacility={(fac) => setSelectedFacility(fac)}
          showHeatmap
          className="h-[600px]"
        />

        {/* Legend Box */}
        <div className="absolute top-4 right-4 z-20 rounded-xl bg-white/95 backdrop-blur-md p-3 shadow-lg border border-slate-200 text-xs space-y-1.5 pointer-events-auto">
          <span className="font-bold text-slate-800 uppercase text-[10px] block">Marker Load Legend</span>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-teal-700" />
            <span className="text-slate-600">Optimal (&gt;15 beds free)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-slate-600">Busy (6–15 beds free)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-600" />
            <span className="text-slate-600">Critical (&le;5 beds free)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t">
            <span className="h-3 w-3 rounded-full bg-amber-300 border border-amber-500" />
            <span className="text-slate-600">Epidemic Watch Zone</span>
          </div>
        </div>
      </div>

      {/* Facility Detail Drawer on pin click */}
      <Drawer
        open={!!selectedFacility}
        onOpenChange={(open) => !open && setSelectedFacility(null)}
        title={selectedFacility?.name}
      >
        {selectedFacility && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border space-y-1">
              <span className="font-bold text-slate-900 block text-sm">{selectedFacility.type.replace(/_/g, ' ')}</span>
              <p className="text-slate-600">{selectedFacility.address}</p>
              <p className="text-slate-500 pt-1">Distance: {selectedFacility.distanceKm} km</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Beds</span>
                <span className="text-lg font-black text-slate-900">
                  {selectedFacility.availableBeds} / {selectedFacility.totalBeds}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-rose-800 block text-[10px] uppercase font-bold">ICU Beds Free</span>
                <span className="text-lg font-black text-rose-700">{selectedFacility.icuBedsAvailable}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-700 block">Active Specialties:</span>
              <div className="flex flex-wrap gap-1">
                {selectedFacility.specialties.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <a
                href={`https://maps.google.com/?q=${selectedFacility.coordinates.lat},${selectedFacility.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Directions
                </Button>
              </a>
              <a href={`tel:${selectedFacility.contactNumber}`} className="flex-1">
                <Button variant="primary" size="sm" className="w-full bg-teal-700 text-xs">
                  Call Desk
                </Button>
              </a>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
