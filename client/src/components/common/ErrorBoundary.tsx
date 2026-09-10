import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ShieldCheck } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('HealthConnect ErrorBoundary caught an unhandled error:', error, errorInfo)
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  private handleGoHome = (): void => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/patient/home'
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 sm:p-12">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200/80 shadow-lg p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full inline-block">
                Application Interruption
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                HealthConnect Encountered an Unexpected Issue
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your medical data and sessions remain secure. We have isolated this screen to prevent any data loss.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-slate-50 rounded-xl p-3 text-left border border-slate-200/70 text-xs font-mono text-slate-600 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5147] text-white font-medium text-sm hover:bg-[#0B3D35] transition shadow-xs focus:ring-2 focus:ring-[#0F5147]/20 focus:outline-none"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition focus:ring-2 focus:ring-slate-300 focus:outline-none"
              >
                <Home className="w-4 h-4" />
                Return to Citizen Home
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ayushman Bharat Digital Mission (ABDM) Compliant & Encrypted</span>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
