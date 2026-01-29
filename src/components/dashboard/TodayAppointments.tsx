import { Clock, User, Stethoscope, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Appointment } from '@/types/clinic';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TodayAppointmentsProps {
  appointments: Appointment[];
}

const statusConfig = {
  scheduled: {
    label: 'مجدول',
    icon: AlertCircle,
    className: 'bg-warning/10 text-warning',
  },
  confirmed: {
    label: 'مؤكد',
    icon: CheckCircle2,
    className: 'bg-success/10 text-success',
  },
  completed: {
    label: 'مكتمل',
    icon: CheckCircle2,
    className: 'bg-muted text-muted-foreground',
  },
  cancelled: {
    label: 'ملغي',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive',
  },
};

export function TodayAppointments({ appointments }: TodayAppointmentsProps) {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-lg">مواعيد اليوم</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          عرض الكل
        </Button>
      </div>
      <div className="divide-y divide-border">
        {appointments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            لا توجد مواعيد اليوم
          </div>
        ) : (
          appointments.map((appointment, index) => {
            const status = statusConfig[appointment.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={appointment.id}
                className="p-4 hover:bg-muted/30 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  {/* Time */}
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-bold text-primary">{appointment.time}</p>
                    <p className="text-xs text-muted-foreground">{appointment.duration} دقيقة</p>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-12 bg-border" />

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{appointment.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Stethoscope className="w-4 h-4" />
                      <span>{appointment.serviceName}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                      status.className
                    )}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{status.label}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
