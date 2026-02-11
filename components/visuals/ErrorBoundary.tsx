import React, { Component, ErrorInfo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // If true, only resets this boundary, not the whole app
  context?: string; // Context for error reporting (e.g., 'Dashboard', 'SEDA', 'Orbit')
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const { context, onError } = this.props;
    const errorContext = context || 'Unknown';
    
    // Enhanced error logging with context
    console.error(`[DEFRAG:${errorContext}] Error caught by boundary:`, {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, info);
    }

    // Report to external error tracking service (if configured)
    this.reportError(error, info, errorContext);
  }

  private reportError = (error: Error, info: ErrorInfo, context: string) => {
    // This could be extended to send to Sentry, LogRocket, etc.
    // For now, we'll just store it locally for debugging
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        context,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      // Store in localStorage for debugging (with size limit)
      const existingErrors = JSON.parse(localStorage.getItem('defrag_errors') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only last 10 errors to prevent storage bloat
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      
      localStorage.setItem('defrag_errors', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('[DEFRAG] Failed to store error report:', e);
    }
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorId: null, retryCount: 0 });
    if (this.props.isolate) {
      // Just reset this boundary
      return;
    }
    // Navigate to safe space
    window.location.href = '/dashboard';
  };

  handleReset = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    // Prevent infinite retry loops - after 3 attempts, suggest reload
    if (newRetryCount >= 3) {
      this.handleReload();
      return;
    }
    
    this.setState({ 
      hasError: false, 
      error: null, 
      errorId: null,
      retryCount: newRetryCount
    });
  };

  private getSafetyMessage = () => {
    const { context } = this.props;
    const { retryCount } = this.state;
    
    if (context === 'SEDA' || context === 'SafePlace') {
      return {
        title: 'Safety System Offline',
        message: 'The grounding protocols encountered an error. Your wellbeing is our priority.',
        action: 'Return to a safe space'
      };
    }
    
    if (context === 'Orbit' || context === 'Signal') {
      return {
        title: 'Analysis Interrupted',
        message: 'The relational mapping system needs recalibration. Your data is safe.',
        action: 'Restart analysis'
      };
    }
    
    if (retryCount >= 2) {
      return {
        title: 'Persistent System Error',
        message: 'Multiple recovery attempts failed. The system will reset to ensure stability.',
        action: 'Full system reset'
      };
    }
    
    return {
      title: 'System Disruption',
      message: 'A structural fault interrupted the architecture. This is recoverable.',
      action: 'Try again'
    };
  };

  render() {
    if (this.state.hasError) {
      const { fallback: CustomFallback } = this.props;
      
      // Use custom fallback if provided
      if (CustomFallback && this.state.error) {
        return <CustomFallback error={this.state.error} retry={this.handleReset} />;
      }

      const safetyMessage = this.getSafetyMessage();
      const { retryCount } = this.state;
      
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center"
          >
            {/* Error Icon - changes based on context */}
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8 ${
              this.props.context === 'SEDA' || this.props.context === 'SafePlace' 
                ? 'bg-amber-500/10 border border-amber-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              {this.props.context === 'SEDA' || this.props.context === 'SafePlace' ? (
                <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-3">{safetyMessage.title}</h1>
            <p className="text-sm text-neutral-400 leading-relaxed mb-2">
              {safetyMessage.message}
            </p>

            {/* Retry count indicator */}
            {retryCount > 0 && (
              <div className="mb-4">
                <span className="text-xs text-neutral-500">
                  Attempt {retryCount + 1} of 3
                </span>
              </div>
            )}

            {/* Error details - collapsible for better UX */}
            {this.state.error && (
              <details className="mt-4 mb-8 text-left">
                <summary className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-400 mb-2">
                  Technical Details {this.state.errorId && `(${this.state.errorId})`}
                </summary>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-red-400/80 font-mono break-all leading-relaxed">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-neutral-600 hover:text-neutral-500">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-neutral-600 mt-2 overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium hover:bg-white/[0.06] transition-all disabled:opacity-50"
                disabled={retryCount >= 3}
              >
                {retryCount >= 2 ? 'Final Attempt' : safetyMessage.action}
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-100 transition-all"
              >
                {this.props.isolate ? 'Reset Component' : 'Return to Lab'}
              </button>
            </div>

            {/* Safety notice for psychological context */}
            {(this.props.context === 'SEDA' || this.props.context === 'SafePlace') && (
              <div className="mt-6 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-xs text-amber-400/80">
                  If you're experiencing distress, please reach out to a mental health professional or crisis helpline.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
