import { BookOpen, BarChart3, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useI18n, StringKey } from '@/lib/i18n';
import { routePrefetch } from '@/App';

const navItems: { path: string; icon: typeof BookOpen; labelKey: StringKey }[] = [
  { path: '/', icon: BookOpen, labelKey: 'nav.learn' },
  { path: '/analytics', icon: BarChart3, labelKey: 'nav.stats' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

const prefetched = new Set<string>();
function prefetch(path: string) {
  if (prefetched.has(path)) return;
  const loader = routePrefetch[path];
  if (!loader) return;
  prefetched.add(path);
  loader().catch(() => prefetched.delete(path));
}

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              onPointerDown={() => prefetch(item.path)}
              onMouseEnter={() => prefetch(item.path)}
              onTouchStart={() => prefetch(item.path)}
              onFocus={() => prefetch(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

