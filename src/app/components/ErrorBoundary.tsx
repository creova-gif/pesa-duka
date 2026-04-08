import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || "Unknown error" };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[PESA DUKA] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-8">
          <div className="max-w-md w-full bg-card border border-destructive/30 rounded-xl p-8 text-center shadow-lg">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-1">
              PESA DUKA encountered an unexpected error. Your data is safe.
            </p>
            <p className="text-xs font-mono bg-muted rounded p-2 mt-3 mb-5 text-left text-destructive">
              {this.state.errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
