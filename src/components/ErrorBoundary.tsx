import { Component, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-light mb-3">Algo salio mal</h2>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              Hubo un error inesperado. Por favor recarga la pagina o contactanos directamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-colors"
              >
                Recargar Pagina
              </button>
              <a
                href="tel:+526674540164"
                className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-xl transition-colors"
              >
                Llamar: (667) 454-0164
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
