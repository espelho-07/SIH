import React, { useState, useEffect } from 'react'
import {
  Clock,
  DoorOpen,
  User,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { formatWaitTime } from '@/lib/utils'
import type { ActiveToken } from '@/types/queue'

export const LiveQueuePage: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [token, setToken] = useState<ActiveToken>({
    id: 'TKN-001',
    tokenNumber: 'B-042',
    facilityId: 'FAC-001',
    facilityName: 'Pandeypur District Hospital',
    departmentName: 'General Medicine & OPD',
    doctorName: 'Dr. Rajesh Verma (MBBS, MD)',
    roomNumber: '14 (First Floor, East Wing)',
    status: 'ISSUED',
    priority: 'GENERAL',
    currentServingToken: 'B-031',
    positionInQueue: 11,
    estimatedWaitMinutes: 28,
    delayReason: 'Doctor attending to emergency trauma admission. Queue will resume in ~15 mins.',
    issuedAtIso: new Date().toISOString(),
  })

  // Simulated queue countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setToken((prev) => ({
        ...prev,
        estimatedWaitMinutes: Math.max(1, prev.estimatedWaitMinutes - 1),
      }))
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const handleCheckIn = () => {
    setIsCheckedIn(true)
    alert('Arrival Confirmed! Hospital counter has been notified. Please be seated near Room 14.')
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">
          <Clock className="w-4 h-4 text-cyan-600" aria-hidden="true" />
          <span>Real-Time OPD Queue Token Monitor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Your Hospital Queue Status
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Track your queue movement live without standing in crowded waiting rooms.
        </p>
      </div>

      {/* Delay Banner if doctor is attending trauma */}
      {token.delayReason && (
        <Alert variant="warning" title="OPD Queue Delay Notification">
          {token.delayReason}
        </Alert>
      )}

      {/* Main Token Digital Card */}
      <Card className="border-cyan-300 shadow-md p-6 bg-gradient-to-b from-white to-cyan-50/20">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {token.facilityName}
            </span>
            <h2 className="text-3xl font-mono font-bold text-cyan-800 mt-0.5">
              Token #{token.tokenNumber}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">{token.departmentName}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs px-3 py-1">
              Priority: {token.priority}
            </Badge>
            <Badge variant="success" className="text-xs px-3 py-1">
              {token.status}
            </Badge>
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 text-center">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider mb-1">
              Currently Serving
            </span>
            <span className="text-3xl font-bold font-mono text-cyan-700">
              #{token.currentServingToken}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">At Doctor Desk</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider mb-1">
              Your Position
            </span>
            <span className="text-3xl font-bold text-slate-900">
              #{token.positionInQueue}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Patients ahead of you</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider mb-1">
              Estimated Wait
            </span>
            <span className="text-3xl font-bold text-emerald-700">
              {formatWaitTime(token.estimatedWaitMinutes)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Dynamic SLA based</span>
          </div>
        </div>

        {/* Room & Doctor Details */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-sm text-slate-700 mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-600" aria-hidden="true" />
            <strong className="text-slate-900">Consulting Physician:</strong>
            <span>{token.doctorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-cyan-600" aria-hidden="true" />
            <strong className="text-slate-900">Consultation Chamber:</strong>
            <span>{token.roomNumber}</span>
          </div>
        </div>

        {/* Geofence Arrival Check-In Button */}
        <div className="space-y-3">
          {!isCheckedIn ? (
            <Button
              variant="accent"
              size="lg"
              onClick={handleCheckIn}
              leftIcon={<MapPin className="w-5 h-5" />}
              className="w-full text-base font-bold shadow-sm"
            >
              I Have Arrived at the Hospital (Confirm Arrival)
            </Button>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center gap-2 text-emerald-800 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Arrival Confirmed — Waiting Room Alert Activated
            </div>
          )}

          <p className="text-center text-xs text-slate-500">
            Geofence active within 500 meters of hospital premises. Check-in ensures your token is called in sequence.
          </p>
        </div>
      </Card>
    </div>
  )
}
