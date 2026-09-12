import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-700">
            {label}
            {props.required && <span className="text-rose-600 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
          className={cn(
            'flex min-h-[44px] w-full rounded-lg border border-slate-300/90 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 transition-colors',
            error && 'border-rose-500 focus-visible:ring-rose-500/20 focus-visible:border-rose-500',
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
            <span>●</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-desc`} className="text-xs text-slate-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
