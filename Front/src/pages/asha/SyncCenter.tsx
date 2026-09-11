import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { useConnection } from '@/contexts/ConnectionContext';
import { getPendingSyncItems } from '@/lib/db';
import { OfflineSyncItem } from '@/types/asha';
import { formatDate } from '@/lib/formatters';
import { RefreshCw, CheckCircle2, Wifi, WifiOff, HardDrive, Database, ArrowRight } from 'lucide-react';

export const SyncCenter: React.FC = () => {
  const { networkState, isOnline, pendingSyncCount, syncOfflineQueue, toggleSimulatedOffline, isSimulatedOffline } =
    useConnection();
  const [queuedItems, setQueuedItems] = useState<OfflineSyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await getPendingSyncItems();
        setQueuedItems(items);
      } catch {
        setQueuedItems([]);
      }
    };
    loadItems();
  }, [pendingSyncCount]);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncOfflineQueue();
    const items = await getPendingSyncItems();
    setQueuedItems(items);
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Offline Storage & Cloud Synchronization"
        subtitle="Manage local browser IndexedDB records, inspect pending queues, and sync data when network coverage is restored."
        breadcrumbs={[{ label: 'ASHA Dashboard', to: '/asha' }, { label: 'Sync Center' }]}
        actions={
          <Button
            onClick={handleSync}
            disabled={!isOnline || pendingSyncCount === 0 || isSyncing}
            variant="primary"
            size="sm"
            className="gap-2 bg-teal-700 hover:bg-teal-800"
            isLoading={isSyncing}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Sync Now to Central Health Grid</span>
          </Button>
        }
      />

      {/* Connectivity & Buffer Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-1">
            {isOnline ? <Wifi className="h-4 w-4 text-emerald-600" /> : <WifiOff className="h-4 w-4 text-amber-600" />}
            <span>Network Status</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{isOnline ? 'Online & Ready' : 'Offline Field Mode'}</p>
          <button
            onClick={toggleSimulatedOffline}
            className="text-[11px] underline text-teal-700 hover:text-teal-900 font-medium mt-1"
          >
            {isSimulatedOffline ? 'Restore live connection' : 'Test offline mode'}
          </button>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-1">
            <Database className="h-4 w-4 text-teal-600" />
            <span>Local Buffer</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{pendingSyncCount} Items</p>
          <span className="text-[11px] text-slate-400">IndexedDB stored</span>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Last Full Sync</span>
          </div>
          <p className="text-xl font-bold text-slate-900">Today, 10:42 AM</p>
          <span className="text-[11px] text-slate-400">Zero conflicts</span>
        </Card>
      </div>

      {/* Queued Items List */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold">Pending Synchronization Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {queuedItems.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="text-sm font-bold text-slate-900">Local Database is Fully Synchronized</p>
              <p className="text-xs text-slate-500">
                All patient registrations, vitals recordings, and screenings have been securely synced to the central government servers.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {queuedItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      {item.entityType.replace(/_/g, ' ')}
                    </span>
                    <p className="text-slate-500">Stored at: {formatDate(item.createdAt)}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
