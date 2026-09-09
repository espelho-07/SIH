import React from 'react'
import { Skeleton } from './Skeleton'

export interface LoadingStateProps {
  cardCount?: number
}

export const LoadingState: React.FC<LoadingStateProps> = ({ cardCount = 3 }) => {
  return (
    <div className="space-y-4 w-full" aria-busy="true" aria-label="Loading content">
      <Skeleton className="h-8 w-1/3 mb-4" />
      {Array.from({ length: cardCount }).map((_, idx) => (
        <div key={idx} className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <div className="pt-2 flex gap-3">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
