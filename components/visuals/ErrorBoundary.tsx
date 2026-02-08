import React, { Component, ErrorInfo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[DEFRAG] Error caught by boundary:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center"
          >
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 mb-8">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-3">System Disruption</h1>
            <p className="text-sm text-neutral-400 leading-relaxed mb-2">
              A structural fault interrupted the architecture. This is recoverable.
            </p>

            {this.state.error && (
              <div className="mt-4 mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-left">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-2">Error Detail</span>
                <p className="text-xs text-red-400/80 font-mono break-all leading-relaxed">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium hover:bg-white/[0.06] transition-all"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-100 transition-all"
              >
                Return to Lab
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
