import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  ClipboardList,
  Bot,
  Settings,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const getNavItems = (t: (key: string) => string) => [
  { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
  { path: '/patients', label: t('nav.patients'), icon: Users },
  { path: '/appointments', label: t('nav.appointments'), icon: Calendar },
  { path: '/services', label: t('nav.services'), icon: Stethoscope },
  { path: '/visits', label: t('nav.visits'), icon: ClipboardList },
  { path: '/ai-assistant', label: t('nav.aiAssistant'), icon: Bot },
  { path: '/settings', label: t('nav.settings'), icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t, dir } = useLanguage();
  const navItems = getNavItems(t);

  return (
    <aside
      className={cn(
        'h-screen gradient-sidebar flex flex-col transition-all duration-300 sticky top-0',
        dir === 'rtl' ? 'border-l border-sidebar-border' : 'border-r border-sidebar-border',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <span className="text-xl">🦷</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-sidebar-foreground text-lg">{t('clinic.name')}</h1>
              <p className="text-xs text-sidebar-foreground/60">{t('clinic.system')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'nav-item',
                isActive && 'nav-item-active',
                collapsed && 'justify-center px-3'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              {dir === 'rtl' ? <ChevronRight className="w-5 h-5 ml-2" /> : <ChevronLeft className="w-5 h-5 mr-2" />}
              <span>{t('nav.collapse')}</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
