import { Home, BookOpen, Plus, BarChart3, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/categories', icon: BookOpen, label: 'Learn' },
  { path: '/log', icon: Plus, label: 'Log', isAction: true },
  { path: '/analytics', icon: BarChart3, label: 'Stats' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

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
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
