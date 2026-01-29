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
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/patients', label: 'المرضى', icon: Users },
  { path: '/appointments', label: 'المواعيد', icon: Calendar },
  { path: '/services', label: 'الخدمات', icon: Stethoscope },
  { path: '/visits', label: 'الزيارات', icon: ClipboardList },
  { path: '/ai-assistant', label: 'المساعد الذكي', icon: Bot },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'h-screen gradient-sidebar border-l border-sidebar-border flex flex-col transition-all duration-300 sticky top-0',
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
              <h1 className="font-bold text-sidebar-foreground text-lg">عيادة الأسنان</h1>
              <p className="text-xs text-sidebar-foreground/60">نظام الإدارة</p>
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
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <>
              <ChevronRight className="w-5 h-5 ml-2" />
              <span>طي القائمة</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
