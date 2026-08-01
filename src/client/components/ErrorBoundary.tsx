import { Component, ReactNode } from 'react';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }

  componentDidCatch(error: Error, info: any) {
    try {
      fetch('/api/system/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: error.message, stack: error.stack, url: window.location.href }),
      }).catch(() => {});
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
          <IconAlertCircle size={56} style={{ color: 'var(--md-error)', marginBottom: 16 }} />
          <h2 className="md3-title-large m-0 mb-8">Something went wrong</h2>
          <p className="md3-body-medium mb-16" style={{ color: 'var(--md-on-surface-variant)' }}>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button className="md3-btn" onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>
            <IconRefresh size={18}/> Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
