import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Clock, User, DoorOpen, Bell } from 'lucide-react'
import { formatWaitTime } from '@/lib/utils'
import type { ActiveToken } from '@/types/queue'

export interface LiveTokenCardProps {
  token: ActiveToken
  onCheckIn?: () => void
  className?: string
}

export const LiveTokenCard: React.FC<LiveTokenCardProps> = ({ token, className }) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {token.facilityName}
          </span>
          <CardTitle className="text-xl text-slate-900 mt-0.5">
            Token: <span className="font-mono text-primary">{token.tokenNumber}</span>
          </CardTitle>
        </div>
        <Badge variant={token.priority === 'EMERGENCY' ? 'destructive' : 'default'}>
          {token.priority}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Delay alert if doctor is held up */}
        {token.delayReason && (
          <Alert variant="warning" title="Doctor Delay Notice">
            {token.delayReason}
          </Alert>
        )}

        {/* Live Queue Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-[#F2F9F8] rounded-xl border border-[#D0EAE6]">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Now Serving</span>
            <span className="text-xl font-bold font-mono text-primary">
              {token.currentServingToken}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 font-medium block">Your Position</span>
            <span className="text-xl font-bold text-slate-900">
              #{token.positionInQueue}{' '}
              <span className="text-xs text-slate-500 font-normal">in line</span>
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-500 font-medium block flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-primary" aria-hidden="true" />
              Est. Wait
            </span>
            <span className="text-xl font-bold text-slate-900">
              {formatWaitTime(token.estimatedWaitMinutes)}
            </span>
          </div>
        </div>

        {/* Doctor & Room Details */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-700 pt-1">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span className="font-medium">{token.doctorName}</span>
            <span className="text-xs text-slate-500">({token.departmentName})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DoorOpen className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span className="font-medium">Room {token.roomNumber}</span>
          </div>
        </div>

        {/* Guidance micro-copy */}
        <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
          <Bell className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span>You will receive an audio chime and SMS alert when your token is called.</span>
        </div>
      </CardContent>
    </Card>
  )
}
