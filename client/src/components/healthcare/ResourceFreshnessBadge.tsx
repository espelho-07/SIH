import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, Clock } from 'lucide-react'
import { formatIndianDateTime } from '@/lib/utils'

export interface ResourceFreshnessBadgeProps {
  lastUpdatedIso: string
  isStale?: boolean
  className?: string
}

export const ResourceFreshnessBadge: React.FC<ResourceFreshnessBadgeProps> = ({
  lastUpdatedIso,
  isStale = false,
  className,
}) => {
  // If explicitly flagged as stale, show warning badge
  if (isStale) {
    return (
      <Badge variant="stale" className={className}>
        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-700" aria-hidden="true" />
        Stale Data (Call to Verify)
      </Badge>
    )
  }

  return (
    <span className={`inline-flex items-center text-xs text-slate-500 ${className}`}>
      <Clock className="w-3 h-3 mr-1 text-slate-400" aria-hidden="true" />
      Updated {formatIndianDateTime(lastUpdatedIso)}
    </span>
  )
}
