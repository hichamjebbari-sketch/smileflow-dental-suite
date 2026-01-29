import { Patient } from '@/types/clinic';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mail, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentPatientsProps {
  patients: Patient[];
}

export function RecentPatients({ patients }: RecentPatientsProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-lg">المرضى الجدد</h3>
        <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/patients')}>
          عرض الكل
        </Button>
      </div>
      <div className="divide-y divide-border">
        {patients.slice(0, 4).map((patient, index) => (
          <div
            key={patient.id}
            className="p-4 hover:bg-muted/30 transition-colors cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => navigate(`/patients/${patient.id}`)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{patient.name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {patient.phone}
                  </span>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
