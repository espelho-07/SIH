import React from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useSyncStore } from '@/stores/syncStore'
import { useTranslation } from 'react-i18next'

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus()
  const pendingCount = useSyncStore((state) => state.pendingMutationsCount)
  const isSyncing = useSyncStore((state) => state.isSyncing)
  const { t } = useTranslation()

  if (isOnline && pendingCount === 0) {
    return null
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs sticky top-0 z-50"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-900 shrink-0" aria-hidden="true" />
        <span>
          {!isOnline
            ? t('common.offlineNotice')
            : `Connected • ${pendingCount} offline records awaiting synchronization`}
        </span>
      </div>

      {isOnline && pendingCount > 0 && (
        <button
          type="button"
          disabled={isSyncing}
          className="ml-3 px-2.5 py-1 bg-amber-900 text-white rounded text-xs font-bold hover:bg-amber-950 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
          {isSyncing ? 'Syncing...' : t('common.syncNow')}
        </button>
      )}
    </aside>
  )
}
