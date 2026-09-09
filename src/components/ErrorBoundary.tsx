import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../components/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-alt">
          <div className="max-w-md w-full bg-white rounded-xl border border-border p-8 text-center">
            <div className="h-16 w-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-text">خطایی رخ داد</h2>
            <p className="text-sm text-text-secondary mb-4">
              متأسفانه خطایی در بارگذاری صفحه رخ داد. لطفاً مجدداً تلاش کنید.
            </p>
            {this.state.error && (
              <details className="text-right mb-4">
                <summary className="text-xs text-text-muted cursor-pointer mb-2">جزئیات خطا</summary>
                <pre className="text-xs bg-surface-alt p-3 rounded border border-border overflow-auto text-left">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3">
              <Button onClick={this.handleReset} className="flex-1">تلاش مجدد</Button>
              <Button variant="secondary" onClick={() => window.location.hash = '/desk'} className="flex-1">
                بازگشت به میز کار
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
