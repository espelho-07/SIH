import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            {label}
            {props.required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-desc` : undefined}
            className={cn(
              'flex min-h-[44px] w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm font-medium text-slate-900 shadow-2xs outline-none transition-all cursor-pointer',
              'hover:border-slate-400',
              'focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/20',
              'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60',
              error && 'border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-white text-slate-900 py-2">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
            <span>●</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-desc`} className="text-xs text-slate-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
