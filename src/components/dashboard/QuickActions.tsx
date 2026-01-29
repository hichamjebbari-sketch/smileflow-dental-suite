import { UserPlus, CalendarPlus, ClipboardPlus, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export function QuickActions() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const actions = [
    {
      label: t('dashboard.newPatient'),
      icon: UserPlus,
      onClick: () => navigate('/patients?action=new'),
      variant: 'default' as const,
    },
    {
      label: t('dashboard.newAppointment'),
      icon: CalendarPlus,
      onClick: () => navigate('/appointments?action=new'),
      variant: 'outline' as const,
    },
    {
      label: t('dashboard.recordVisit'),
      icon: ClipboardPlus,
      onClick: () => navigate('/visits?action=new'),
      variant: 'outline' as const,
    },
    {
      label: t('dashboard.aiAssistant'),
      icon: Bot,
      onClick: () => navigate('/ai-assistant'),
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 p-4">
      <h3 className="font-semibold text-lg mb-4">{t('dashboard.quickActions')}</h3>
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
