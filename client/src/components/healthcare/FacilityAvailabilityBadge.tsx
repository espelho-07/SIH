import React from 'react'
import { Badge } from '@/components/ui/Badge'
import type { OperationalStatus } from '@/types/facility'

export interface FacilityAvailabilityBadgeProps {
  status: OperationalStatus
  className?: string
}

export const FacilityAvailabilityBadge: React.FC<FacilityAvailabilityBadgeProps> = ({
  status,
  className,
}) => {
  switch (status) {
    case 'OPERATIONAL':
      return (
        <Badge variant="success" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" aria-hidden="true" />
          Operational & Available
        </Badge>
      )
    case 'OVERLOADED':
      return (
        <Badge variant="warning" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" aria-hidden="true" />
          High Patient Load
        </Badge>
      )
    case 'DISRUPTED':
    case 'MAINTENANCE':
      return (
        <Badge variant="destructive" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" aria-hidden="true" />
          Service Disrupted / Diverting
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className={className}>
          Unknown Status
        </Badge>
      )
  }
}
