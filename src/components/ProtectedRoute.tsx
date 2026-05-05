import { ReactNode } from 'react';
import { useDataStatus } from '@/lib/store';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading: dataLoading, error } = useDataStatus();

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-sm font-medium">Can't reach the server</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
