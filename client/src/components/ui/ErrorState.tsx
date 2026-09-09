import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from './Button'

export interface ErrorStateProps {
  title?: string
  message: string
  correlationId?: string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Healthcare Information',
  message,
  correlationId,
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-red-50/60 rounded-xl border border-red-200',
        className
      )}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600 mb-4">
        <AlertCircle className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-red-950 mb-1.5">{title}</h3>
      <p className="text-sm text-red-800 max-w-md mb-4 leading-relaxed">{message}</p>
      {correlationId && (
        <p className="text-xs font-mono text-slate-500 mb-4">
          Ref ID: <span className="text-slate-700">{correlationId}</span>
        </p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" leftIcon={<RotateCcw className="w-4 h-4" />}>
          Try Again
        </Button>
      )}
    </div>
  )
}
