import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  mobileHidden?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  searchQuery?: string;
  searchFilter?: (item: T, query: string) => boolean;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  renderMobileCard?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
  disableMobileCards?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  searchQuery = '',
  searchFilter,
  pageSize = 10,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no items matching your criteria.',
  renderMobileCard,
  onRowClick,
  className,
  disableMobileCards = false,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchFilter) return data;
    return data.filter((item) => searchFilter(item, searchQuery.trim()));
  }, [data, searchQuery, searchFilter]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return sortAsc ? -1 : 1;
      return sortAsc ? 1 : -1;
    });
  }, [filteredData, sortKey, sortAsc]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  if (sortedData.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className="my-6" />;
  }

  // Identify primary header, status/badge, action column for fallback mobile card
  const primaryCol = columns[0];
  const lastCol = columns[columns.length - 1];
  const isLastColAction =
    lastCol &&
    (lastCol.header === 'Actions' ||
      lastCol.header === 'Action' ||
      lastCol.header === '' ||
      lastCol.key.toLowerCase().includes('action'));
  const bodyCols = columns.filter((col, idx) => {
    if (idx === 0) return false;
    if (isLastColAction && idx === columns.length - 1) return false;
    return !col.mobileHidden;
  });

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* 1. Mobile Cards View (Hidden on desktop md+) */}
      {!disableMobileCards && (
        <div className="md:hidden space-y-3">
          {paginatedData.map((item) => (
            <div
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3 transition-all',
                onRowClick && 'cursor-pointer active:scale-[0.99]'
              )}
            >
              {renderMobileCard ? (
                renderMobileCard(item)
              ) : (
                <>
                  {/* Card Header Row */}
                  {primaryCol && (
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="font-semibold text-slate-900 text-sm">
                        {primaryCol.render ? primaryCol.render(item) : String((item as Record<string, unknown>)[primaryCol.key] ?? '—')}
                      </div>
                    </div>
                  )}

                  {/* Key-Value Details */}
                  <div className="space-y-2 text-xs">
                    {bodyCols.map((col) => (
                      <div key={col.key} className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 font-medium shrink-0">{col.header}:</span>
                        <span className="text-slate-800 text-right truncate font-medium">
                          {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '—')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions Row if present */}
                  {isLastColAction && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      {lastCol.render ? lastCol.render(item) : null}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. Desktop Full Data Table (Hidden on mobile if mobile cards enabled) */}
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs',
          !disableMobileCards && 'hidden md:block'
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={cn('px-4 py-3.5', col.className)}>
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 focus-visible:outline-none"
                      >
                        <span>{col.header}</span>
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'transition-colors hover:bg-slate-50/80',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3.5 whitespace-nowrap', col.className)}>
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-2 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 p-0"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
