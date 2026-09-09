import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind classes safely with clsx and twMerge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format timestamps into human-readable Indian standard format.
 */
export function formatIndianDateTime(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

/**
 * Format relative minutes remaining (e.g. "Wait ~28 mins").
 */
export function formatWaitTime(minutes: number): string {
  if (minutes <= 0) return 'Immediate / Next'
  if (minutes < 60) return `~${minutes} mins`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `~${hrs} hr${hrs > 1 ? 's' : ''} ${mins > 0 ? `${mins}m` : ''}`
}
