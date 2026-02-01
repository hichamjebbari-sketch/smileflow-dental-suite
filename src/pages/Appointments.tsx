import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
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
import { CalendarPlus, Clock, User, Stethoscope, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;
type Service = Tables<'services'>;
type Appointment = Tables<'appointments'> & {
  patients?: { name: string } | null;
  services?: { name: string; duration: number } | null;
};

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [appointmentsRes, patientsRes, servicesRes] = await Promise.all([
        supabase
          .from('appointments')
          .select(`
            *,
            patients(name),
            services(name, duration)
          `)
          .order('date', { ascending: true })
          .order('time', { ascending: true }),
        supabase
          .from('patients')
          .select('*')
          .order('name'),
        supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('name'),
      ]);

      if (appointmentsRes.error) throw appointmentsRes.error;
      if (patientsRes.error) throw patientsRes.error;
      if (servicesRes.error) throw servicesRes.error;

      setAppointments(appointmentsRes.data || []);
      setPatients(patientsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAppointments = appointments.filter(
    (apt) => filterStatus === 'all' || apt.status === filterStatus
  );

  const handleAddAppointment = async (formData: FormData) => {
    try {
      setSubmitting(true);
      
      const patientId = formData.get('patientId') as string;
      const serviceId = formData.get('serviceId') as string;
      const selectedService = services.find((s) => s.id === serviceId);

      const appointmentData = {
        patient_id: patientId,
        service_id: serviceId || null,
        date: formData.get('date') as string,
        time: formData.get('time') as string,
        duration: selectedService?.duration || 30,
        status: 'scheduled',
        notes: (formData.get('notes') as string) || null,
      };

      const { error } = await supabase
        .from('appointments')
        .insert(appointmentData);

      if (error) throw error;

      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة الموعد بنجاح',
      });

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة الموعد',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'تم التحديث',
        description: 'تم تحديث حالة الموعد',
      });

      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الحالة',
        variant: 'destructive',
      });
    }
  };

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce((acc, apt) => {
    if (!acc[apt.date]) {
      acc[apt.date] = [];
    }
    acc[apt.date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  if (loading) {
    return (
      <MainLayout title="إدارة المواعيد" subtitle="عرض وإدارة مواعيد المرضى">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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
                      {patients.map((patient) => (
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
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {Number(service.price)} درهم
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
                  disabled={submitting}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  إضافة الموعد
                </Button>
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
                  const status = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.scheduled;
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
                            {appointment.time?.slice(0, 5)}
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
                              {appointment.patients?.name || 'غير محدد'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Stethoscope className="w-4 h-4" />
                            <span>{appointment.services?.name || 'غير محدد'}</span>
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
