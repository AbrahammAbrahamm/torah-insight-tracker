import { BookOpen, Plus, BarChart3, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useI18n, StringKey } from '@/lib/i18n';

const navItems: { path: string; icon: typeof BookOpen; labelKey: StringKey; isAction?: boolean }[] = [
  { path: '/', icon: BookOpen, labelKey: 'nav.learn' },
  { path: '/log', icon: Plus, labelKey: 'nav.log', isAction: true },
  { path: '/analytics', icon: BarChart3, labelKey: 'nav.stats' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

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

          if (item.isAction) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-primary shadow-lg -mt-4"
                aria-label={t(item.labelKey)}
              >
                <Icon className="w-6 h-6 text-primary-foreground" />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
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
