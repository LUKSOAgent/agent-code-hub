import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    // Could send to error reporting service here
    // reportError(error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback 
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        onReload={this.handleReload}
        onGoHome={this.handleGoHome}
        onReset={this.handleReset}
      />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReload: () => void;
  onGoHome: () => void;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onReload,
  onGoHome,
  onReset
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center animate-fade-up">
        {/* Error Icon */}
        <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8 animate-pulse">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Oops! Something went wrong
        </h1>

        {/* Description */}
        <p className="text-slate-400 mb-8 leading-relaxed">
          We&apos;re sorry, but something unexpected happened. 
          Try refreshing the page or going back home.
        </p>

        {/* Error Message (if available) */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
            <p className="text-red-400 text-sm font-medium mb-1">
              {error.name}
            </p>
            <p className="text-red-300/80 text-sm">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Button 
            onClick={onReload}
            icon={RefreshCw}
            className="w-full sm:w-auto"
          >
            Reload Page
          </Button>
          <Button 
            variant="outline"
            onClick={onGoHome}
            icon={Home}
            className="w-full sm:w-auto"
          >
            Go Home
          </Button>
        </div>

        {/* Technical Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-center gap-2 mx-auto text-slate-500 hover:text-slate-300 transition-colors text-sm"
        >
          <Bug className="w-4 h-4" />
          {showDetails ? 'Hide technical details' : 'Show technical details'}
        </button>

        {/* Stack Trace */}
        {showDetails && errorInfo && (
          <div className="mt-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-auto max-h-64">
              <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap">
                {errorInfo.componentStack}
              </pre>
            </div>
          </div>
        )}

        {/* Reset Link (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={onReset}
            className="mt-4 text-slate-600 hover:text-slate-400 text-xs underline"
          >
            Reset Error Boundary (Dev Only)
          </button>
        )}
      </div>
    </div>
  );
};

// Section-level error boundary for smaller areas
export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-slate-300 text-sm mb-3">Failed to load this section</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={this.handleRetry}
            icon={RefreshCw}
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
