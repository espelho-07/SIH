import React, { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const FacilityBedsPage: React.FC = () => {
  const [bedCensus] = useState({
    icu: { total: 20, available: 4, occupied: 14, reserved: 2 },
    oxygen: { total: 60, available: 18, occupied: 40, reserved: 2 },
    general: { total: 200, available: 42, occupied: 155, reserved: 3 },
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
            Pandeypur District Hospital &bull; Ward Telemetry
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Real-Time Bed Census & Reservation Hub
          </h1>
          <p className="text-xs text-slate-500">
            Pessimistic locking active: Inbound emergency trauma referrals lock beds for 45 minutes SLA.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => alert('Refreshing live bed telemetry from IoT ward sensor...')}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Census
        </Button>
      </div>

      {/* Bed Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* ICU Beds */}
        <Card className="p-5 border-l-4 border-l-red-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Intensive Care (ICU)
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-3xl font-bold text-slate-900">{bedCensus.icu.available}</span>
            <span className="text-xs text-slate-500">Available / {bedCensus.icu.total} Total</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
            <div className="flex justify-between">
              <span>Occupied:</span>
              <strong className="text-slate-800">{bedCensus.icu.occupied}</strong>
            </div>
            <div className="flex justify-between text-purple-700 font-semibold">
              <span>Inbound Referral Locked:</span>
              <strong>{bedCensus.icu.reserved}</strong>
            </div>
          </div>
        </Card>

        {/* Oxygen Beds */}
        <Card className="p-5 border-l-4 border-l-cyan-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Oxygen Supported Beds
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-3xl font-bold text-slate-900">{bedCensus.oxygen.available}</span>
            <span className="text-xs text-slate-500">Available / {bedCensus.oxygen.total} Total</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
            <div className="flex justify-between">
              <span>Occupied:</span>
              <strong className="text-slate-800">{bedCensus.oxygen.occupied}</strong>
            </div>
            <div className="flex justify-between text-purple-700 font-semibold">
              <span>Inbound Referral Locked:</span>
              <strong>{bedCensus.oxygen.reserved}</strong>
            </div>
          </div>
        </Card>

        {/* General Ward Beds */}
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            General Inpatient Beds
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-3xl font-bold text-slate-900">{bedCensus.general.available}</span>
            <span className="text-xs text-slate-500">Available / {bedCensus.general.total} Total</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
            <div className="flex justify-between">
              <span>Occupied:</span>
              <strong className="text-slate-800">{bedCensus.general.occupied}</strong>
            </div>
            <div className="flex justify-between text-purple-700 font-semibold">
              <span>Inbound Referral Locked:</span>
              <strong>{bedCensus.general.reserved}</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
