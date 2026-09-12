import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'emergency' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary: 'bg-gradient-to-r from-sky-600 via-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-xs shadow-sky-600/20 font-semibold transition-all',
      secondary: 'bg-white text-slate-700 hover:bg-slate-50/90 border border-slate-200 hover:border-slate-300 font-medium shadow-2xs transition-all',
      outline: 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50/90 hover:border-slate-300 font-medium shadow-2xs transition-all',
      ghost: 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium transition-colors',
      destructive: 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 shadow-xs shadow-rose-600/20 font-medium transition-all',
      emergency: 'bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-700 hover:to-rose-800 font-bold tracking-wide uppercase shadow-xs shadow-red-600/25 transition-all',
      success: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 shadow-xs shadow-emerald-600/20 font-medium transition-all',
    };

    // Minimum 44px touch target on mobile where appropriate (size md is min-h-[44px])
    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'min-h-[44px] h-11 px-4 py-2 text-sm',
      lg: 'min-h-[48px] h-12 px-6 text-base',
      icon: 'h-11 w-11 p-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
