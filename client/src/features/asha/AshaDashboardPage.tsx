import React from 'react'
import {
  Users,
  ShieldAlert,
  Calendar,
  RefreshCw,
  Plus,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useSyncStore } from '@/stores/syncStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export const AshaDashboardPage: React.FC = () => {
  const isOnline = useOnlineStatus()
  const isSyncing = useSyncStore((state) => state.isSyncing)
  const setIsSyncing = useSyncStore((state) => state.setIsSyncing)
  const setLastSyncedAt = useSyncStore((state) => state.setLastSyncedAt)

  // High-Risk Maternal & Child Surveillance Register
  const highRiskPatients = [
    {
      id: 'P-101',
      name: 'Sunita Devi (Age 24)',
      village: 'Kalyanpur, Ward 4',
      condition: 'Severe Anemia (Hb: 6.8 g/dL) • 3rd Trimester (32 Weeks)',
      urgency: 'HIGH_RISK_RED',
      lastVisit: '2 days ago',
      actionNeeded: 'Urgent Iron Sucrose Infusion at CHC',
    },
    {
      id: 'P-102',
      name: 'Rekha Kumari (Age 29)',
      village: 'Shivpur, Tola 2',
      condition: 'Pregnancy-Induced Hypertension (BP: 150/98 mmHg)',
      urgency: 'HIGH_RISK_RED',
      lastVisit: 'Yesterday',
      actionNeeded: 'Daily BP Monitoring & Specialist Referral',
    },
  ]

  // Today's scheduled visits
  const scheduledVisits = [
    {
      id: 'V-01',
      familyHead: 'Ram Prasad',
      houseNumber: 'H-42',
      task: 'Post-Natal Care (Day 7 Visit) & Infant Weight',
      status: 'PENDING',
    },
    {
      id: 'V-02',
      familyHead: 'Dinesh Yadav',
      houseNumber: 'H-18',
      task: 'Penta-1 Immunization Follow-Up (Child 6 weeks)',
      status: 'COMPLETED',
    },
  ]

  const handleManualSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setLastSyncedAt(new Date().toISOString())
      alert('All local field survey and vitals records successfully synchronized with district server!')
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner: Status & Sync Control */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
              Frontline Field Console
            </span>
            <Badge variant={isOnline ? 'success' : 'warning'}>
              {isOnline ? 'Online Connected' : 'Offline Mode (Local Storage)'}
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            ASHA Worker Daily Action Board
          </h1>
          <p className="text-xs text-slate-500">
            Assigned Village: <strong className="text-slate-700">Kalyanpur (Pop: 1,420)</strong> &bull; Ward 4
          </p>
        </div>

        <Button
          variant={isOnline ? 'accent' : 'outline'}
          size="sm"
          onClick={handleManualSync}
          isLoading={isSyncing}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          {isSyncing ? 'Syncing...' : 'Sync Pending Data'}
        </Button>
      </div>

      {/* High-Risk Red Category Maternal Watchlist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-600" aria-hidden="true" />
            High-Risk Maternal Watchlist ({highRiskPatients.length} Active Cases)
          </h2>
          <span className="text-xs text-slate-500">Mandatory Weekly Follow-up</span>
        </div>

        {highRiskPatients.map((patient) => (
          <Card key={patient.id} className="p-4 border-l-4 border-l-red-600 bg-red-50/20">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">{patient.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  {patient.village} &bull; Last visited: {patient.lastVisit}
                </p>
              </div>
              <Badge variant="destructive">RED FLAG</Badge>
            </div>

            <div className="p-2.5 bg-red-50 rounded-lg text-xs font-medium text-red-900 mb-3 border border-red-200">
              <strong>Clinical Finding:</strong> {patient.condition}
              <div className="mt-1 font-bold text-red-950">Required Action: {patient.actionNeeded}</div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert(`Recording vitals for ${patient.name}`)}
              >
                Record Vitals
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => alert(`Initiating teleconsultation referral for ${patient.name}`)}
              >
                Request Doctor Teleconsult
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Today's Scheduled Door-to-Door Visits */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-600" aria-hidden="true" />
            Today's Door-to-Door Action Plan
          </h2>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => alert('New household survey form opened')}
          >
            + New Household Visit
          </Button>
        </div>

        {scheduledVisits.map((visit) => (
          <Card key={visit.id} className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {visit.familyHead} ({visit.houseNumber})
                </h4>
                <p className="text-xs text-slate-500">{visit.task}</p>
              </div>
            </div>

            <Badge variant={visit.status === 'COMPLETED' ? 'success' : 'default'}>
              {visit.status}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  )
}
