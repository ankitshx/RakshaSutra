import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RakshaSutra Component Error caught by Boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = 'landing';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-6">
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white mb-2">
              Defensive Shield Intercepted an Error
            </h1>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              An unexpected component anomaly occurred while rendering this module. RakshaSutra core security systems prevented a catastrophic crash.
            </p>

            {this.state.error && (
              <div className="p-3 mb-6 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto max-h-32">
                {this.state.error.message || 'Unknown runtime exception'}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
              >
                <RefreshCw className="w-4 h-4" /> Reload Session
              </button>
              <button
                onClick={() => {
                  window.location.hash = 'landing';
                  window.location.reload();
                }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <Home className="w-4 h-4" /> Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
