import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import {
  initialErrorBoundaryState,
  getDerivedStateFromErrorLogic,
  resetErrorBoundaryLogic
} from './errorBoundaryCore';

/**
 * ==============================================================================
 * MEDORA Application-Level & Section-Level Error Boundary
 * ==============================================================================
 * 
 * Purpose:
 * Catch runtime JavaScript rendering exceptions in sub-components, log diagnostic
 * traces, prevent white-screen crashes across the pharmacy interface, and present
 * a non-disruptive, gracefully degraded fallback recovery UI.
 * 
 * Key React Lifecycles:
 * 1. getDerivedStateFromError(error):
 *    Invoked during the render phase when a descendant component throws an error.
 *    Transitions hasError to true and stores the error payload.
 * 
 * 2. componentDidCatch(error, errorInfo):
 *    Invoked during the commit phase for side effects. Logs error stacks to monitoring
 *    consoles and audit facilities without breaking execution.
 * 
 * 3. handleReset():
 *    Permits on-the-fly component tree recovery without requiring full page reload.
 * ==============================================================================
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...initialErrorBoundaryState };
  }

  static getDerivedStateFromError(error) {
    return getDerivedStateFromErrorLogic(error);
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MEDORA ErrorBoundary] Caught uncaught UI error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState(resetErrorBoundaryLogic());
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6" role="alert" aria-live="assertive">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-100 shadow-xl shadow-rose-500/5 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected display error occurred while rendering this section.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-left font-mono break-all max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
