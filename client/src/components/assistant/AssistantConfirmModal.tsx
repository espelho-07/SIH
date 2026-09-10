import React from 'react'
import { AlertCircle, X, CheckCircle2 } from 'lucide-react'
import type { AssistantProposedAction } from '@/types/assistant'

interface AssistantConfirmModalProps {
  action: AssistantProposedAction | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (action: AssistantProposedAction) => void
  isExecuting?: boolean
}

export const AssistantConfirmModal: React.FC<AssistantConfirmModalProps> = ({
  action,
  isOpen,
  onClose,
  onConfirm,
  isExecuting = false,
}) => {
  if (!isOpen || !action) return null

  const isDestructive = action.type === 'CANCEL_APPOINTMENT'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-[#F2F9F8] text-[#0F5147] border border-[#D0EAE6]'
              }`}
            >
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-base font-bold text-slate-900 leading-tight">
                {action.title}
              </h3>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Consequential Action Confirmation
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Description & Prompt */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <p className="font-medium text-slate-800 leading-relaxed">
            {action.confirmationPrompt || action.description}
          </p>
          {isDestructive ? (
            <p className="text-red-700 font-medium">
              ⚠️ Warning: This action is irreversible. The booked consultation slot will be cancelled and made available to other waiting patients.
            </p>
          ) : (
            <p className="text-slate-500">
              This request will be verified directly against the public hospital HMIS and HealthConnect records.
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all touch-target"
          >
            Cancel / Dismiss
          </button>
          <button
            type="button"
            onClick={() => onConfirm(action)}
            disabled={isExecuting}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-2xs touch-target disabled:opacity-60 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#0F5147] hover:bg-[#0B3D35]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isExecuting ? 'Processing...' : 'Confirm & Execute'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
