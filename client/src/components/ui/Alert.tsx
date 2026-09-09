import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'destructive'
  title?: string
  onClose?: () => void
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  children,
  onClose,
  ...props
}) => {
  const icons = {
    info: <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />,
    destructive: <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />,
  }

  const variants = {
    info: 'bg-blue-50/70 border-blue-200 text-blue-950',
    success: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
    warning: 'bg-amber-50/70 border-amber-200 text-amber-950',
    destructive: 'bg-red-50/70 border-red-200 text-red-950',
  }

  return (
    <div
      role="alert"
      className={cn('flex items-start gap-3 p-4 rounded-xl border', variants[variant], className)}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1 text-sm">
        {title && <h5 className="font-semibold mb-1 text-base leading-tight">{title}</h5>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
