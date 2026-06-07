import { lazy, Suspense, useEffect, useState, type ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/layout/BottomNav";
import { I18nProvider } from "@/components/I18nProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/lib/store";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Categories from "./pages/Categories";

const logEntryLoader = () => import("./pages/LogEntry");
const analyticsLoader = () => import("./pages/Analytics");
const settingsLoader = () => import("./pages/SettingsPage");
const authLoader = () => import("./pages/Auth");
const notFoundLoader = () => import("./pages/NotFound");

const LogEntry = lazy(logEntryLoader);
const Analytics = lazy(analyticsLoader);
const SettingsPage = lazy(settingsLoader);
const Auth = lazy(authLoader);
const NotFound = lazy(notFoundLoader);

// Prefetchers exposed for BottomNav hover/pointerdown
export const routePrefetch: Record<string, () => Promise<unknown>> = {
  '/log': logEntryLoader,
  '/analytics': analyticsLoader,
  '/settings': settingsLoader,
  '/auth': authLoader,
};

const queryClient = new QueryClient();

function useIdleMount() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const ric: (cb: () => void) => number =
      typeof (window as any).requestIdleCallback === 'function'
        ? (cb) => (window as any).requestIdleCallback(cb, { timeout: 2000 })
        : (cb) => window.setTimeout(cb, 200);
    const cic: (id: number) => void =
      typeof (window as any).cancelIdleCallback === 'function'
        ? (id) => (window as any).cancelIdleCallback(id)
        : (id) => window.clearTimeout(id);
    const id = ric(() => setReady(true));
    return () => cic(id);
  }, []);
  return ready;
}

const DeferredToaster = lazy(() =>
  import("@/components/ui/toaster").then(m => ({ default: m.Toaster as ComponentType }))
);
const DeferredSonner = lazy(() =>
  import("@/components/ui/sonner").then(m => ({ default: m.Toaster as ComponentType }))
);
const DeferredReminderScheduler = lazy(() =>
  import("@/components/ReminderScheduler").then(m => ({ default: m.ReminderScheduler as ComponentType }))
);

function DeferredOverlays() {
  const ready = useIdleMount();
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <DeferredToaster />
      <DeferredSonner />
      <DeferredReminderScheduler />
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <I18nProvider>
            <TooltipProvider>
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                  <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                  <Route path="/log" element={<ProtectedRoute><LogEntry /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <BottomNav />
              <DeferredOverlays />
            </TooltipProvider>
          </I18nProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
