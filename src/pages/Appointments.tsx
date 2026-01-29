import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockAppointments, mockPatients, mockServices } from '@/data/mockData';
import { Appointment } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarPlus, Clock, User, Stethoscope, CheckCircle2, XCircle, AlertCircle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusConfig = {
  scheduled: {
    label: 'مجدول',
    icon: AlertCircle,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  confirmed: {
    label: 'مؤكد',
    icon: CheckCircle2,
    className: 'bg-success/10 text-success border-success/20',
  },
  completed: {
    label: 'مكتمل',
    icon: CheckCircle2,
    className: 'bg-muted text-muted-foreground border-muted',
  },
  cancelled: {
    label: 'ملغي',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredAppointments = appointments.filter(
    (apt) => filterStatus === 'all' || apt.status === filterStatus
  );

  const handleAddAppointment = (formData: FormData) => {
    const patientId = formData.get('patientId') as string;
    const serviceId = formData.get('serviceId') as string;
    const patient = mockPatients.find((p) => p.id === patientId);
    const service = mockServices.find((s) => s.id === serviceId);

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientId,
      patientName: patient?.name || '',
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      duration: service?.duration || 30,
      serviceId,
      serviceName: service?.name || '',
      status: 'scheduled',
      notes: formData.get('notes') as string,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAppointments([newAppointment, ...appointments]);
    setIsDialogOpen(false);
  };

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status } : apt
      )
    );
  };

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce((acc, apt) => {
    if (!acc[apt.date]) {
      acc[apt.date] = [];
    }
    acc[apt.date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <MainLayout title="إدارة المواعيد" subtitle="عرض وإدارة مواعيد المرضى">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="flex-1">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="scheduled">مجدول</TabsTrigger>
            <TabsTrigger value="confirmed">مؤكد</TabsTrigger>
            <TabsTrigger value="completed">مكتمل</TabsTrigger>
            <TabsTrigger value="cancelled">ملغي</TabsTrigger>
          </TabsList>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <CalendarPlus className="w-4 h-4" />
              موعد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة موعد جديد</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAppointment(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="patientId">المريض</Label>
                  <Select name="patientId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المريض" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="serviceId">الخدمة</Label>
                  <Select name="serviceId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الخدمة" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {service.price} درهم
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">التاريخ</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div>
                  <Label htmlFor="time">الوقت</Label>
                  <Input id="time" name="time" type="time" required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea id="notes" name="notes" rows={2} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit">إضافة الموعد</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        {Object.entries(groupedAppointments)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, dayAppointments]) => (
            <div key={date} className="animate-slide-up">
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                {new Date(date).toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div className="grid gap-3">
                {dayAppointments.map((appointment) => {
                  const status = statusConfig[appointment.status];
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={appointment.id}
                      className="bg-card rounded-xl shadow-card border border-border/50 p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        {/* Time */}
                        <div className="text-center min-w-[80px] py-2 px-3 bg-primary/5 rounded-lg">
                          <p className="text-xl font-bold text-primary">
                            {appointment.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.duration} دقيقة
                          </p>
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-lg">
                              {appointment.patientName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Stethoscope className="w-4 h-4" />
                            <span>{appointment.serviceName}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
                            status.className
                          )}
                        >
                          <StatusIcon className="w-4 h-4" />
                          <span>{status.label}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {appointment.status === 'scheduled' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(appointment.id, 'confirmed')
                              }
                            >
                              تأكيد
                            </Button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusChange(appointment.id, 'completed')
                              }
                            >
                              إكمال
                            </Button>
                          )}
                          {(appointment.status === 'scheduled' ||
                            appointment.status === 'confirmed') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                handleStatusChange(appointment.id, 'cancelled')
                              }
                            >
                              إلغاء
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {filteredAppointments.length === 0 && (
          <div className="bg-card rounded-xl p-12 text-center text-muted-foreground">
            لا توجد مواعيد
          </div>
        )}
      </div>
    </MainLayout>
  );
}
