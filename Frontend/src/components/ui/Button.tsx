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
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary: 'bg-teal-700 text-white hover:bg-teal-800 shadow-xs font-medium',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80 font-medium',
      outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium shadow-2xs',
      ghost: 'text-slate-600 hover:bg-slate-100 font-medium',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs font-medium',
      emergency: 'bg-red-600 text-white hover:bg-red-700 font-bold tracking-wide uppercase shadow-xs',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs font-medium',
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
