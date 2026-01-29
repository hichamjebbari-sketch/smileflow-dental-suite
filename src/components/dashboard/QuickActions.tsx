import { UserPlus, CalendarPlus, ClipboardPlus, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'مريض جديد',
      icon: UserPlus,
      onClick: () => navigate('/patients?action=new'),
      variant: 'default' as const,
    },
    {
      label: 'موعد جديد',
      icon: CalendarPlus,
      onClick: () => navigate('/appointments?action=new'),
      variant: 'outline' as const,
    },
    {
      label: 'تسجيل زيارة',
      icon: ClipboardPlus,
      onClick: () => navigate('/visits?action=new'),
      variant: 'outline' as const,
    },
    {
      label: 'المساعد الذكي',
      icon: Bot,
      onClick: () => navigate('/ai-assistant'),
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 p-4">
      <h3 className="font-semibold text-lg mb-4">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.variant}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={action.onClick}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
