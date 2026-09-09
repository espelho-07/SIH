import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#0F5147] focus-visible:ring-offset-2 select-none'

    const variants = {
      primary: 'bg-[#0F5147] text-white hover:bg-[#0A3F37] active:scale-[0.98] shadow-2xs',
      accent: 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] shadow-2xs',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.98]',
      outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] shadow-2xs',
      ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-2xs',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-xs font-semibold px-4 py-2 min-h-[40px] gap-2',
      lg: 'text-sm font-semibold px-5 py-3 min-h-[48px] gap-2.5', // WCAG touch target
      icon: 'h-10 w-10 p-2 touch-target',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
