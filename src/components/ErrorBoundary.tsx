import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] Runtime error during render:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6">
              <span className="text-2xl font-bold font-display">V</span>
            </div>
            <h1 className="text-2xl font-bold font-display mb-2">Something went wrong</h1>
            <p className="text-text-secondary mb-6">
              The app hit an unexpected error. Try again — your progress is saved.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-accent text-white font-semibold shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all active:scale-[0.98]"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
