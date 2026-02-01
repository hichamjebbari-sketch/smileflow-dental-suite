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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClipboardPlus, Calendar, User, Stethoscope, Banknote, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;
type Service = Tables<'services'>;
type Visit = Tables<'visits'> & {
  patients?: { name: string } | null;
};
type VisitService = Tables<'visit_services'> & {
  services?: { name: string } | null;
};

export default function Visits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [visitServices, setVisitServices] = useState<Record<string, VisitService[]>>({});
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [visitsRes, patientsRes, servicesRes] = await Promise.all([
        supabase
          .from('visits')
          .select(`
            *,
            patients(name)
          `)
          .order('date', { ascending: false }),
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

      if (visitsRes.error) throw visitsRes.error;
      if (patientsRes.error) throw patientsRes.error;
      if (servicesRes.error) throw servicesRes.error;

      setVisits(visitsRes.data || []);
      setPatients(patientsRes.data || []);
      setServices(servicesRes.data || []);

      // Fetch visit services for all visits
      if (visitsRes.data && visitsRes.data.length > 0) {
        const visitIds = visitsRes.data.map(v => v.id);
        const { data: vsData, error: vsError } = await supabase
          .from('visit_services')
          .select(`
            *,
            services(name)
          `)
          .in('visit_id', visitIds);

        if (vsError) throw vsError;

        // Group by visit_id
        const grouped: Record<string, VisitService[]> = {};
        (vsData || []).forEach(vs => {
          if (!grouped[vs.visit_id]) {
            grouped[vs.visit_id] = [];
          }
          grouped[vs.visit_id].push(vs);
        });
        setVisitServices(grouped);
      }
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

  const filteredVisits = visits.filter((visit) => {
    const patientName = visit.patients?.name || '';
    return (
      patientName.includes(searchQuery) ||
      visit.diagnosis?.includes(searchQuery) ||
      visit.treatment?.includes(searchQuery)
    );
  });

  const handleAddVisit = async (formData: FormData) => {
    try {
      setSubmitting(true);
      
      const patientId = formData.get('patientId') as string;
      const serviceId = formData.get('services') as string;
      const selectedService = services.find((s) => s.id === serviceId);
      const totalCost = selectedService ? Number(selectedService.price) : 0;

      // Create visit
      const { data: visitData, error: visitError } = await supabase
        .from('visits')
        .insert({
          patient_id: patientId,
          date: formData.get('date') as string,
          diagnosis: (formData.get('diagnosis') as string) || null,
          treatment: (formData.get('treatment') as string) || null,
          notes: (formData.get('notes') as string) || null,
          total_cost: totalCost,
          doctor_name: 'د. سارة أحمد',
        })
        .select()
        .single();

      if (visitError) throw visitError;

      // Add visit service
      if (selectedService && visitData) {
        const { error: vsError } = await supabase
          .from('visit_services')
          .insert({
            visit_id: visitData.id,
            service_id: selectedService.id,
            price_at_time: Number(selectedService.price),
            quantity: 1,
          });

        if (vsError) throw vsError;
      }

      toast({
        title: 'تم التسجيل',
        description: 'تم تسجيل الزيارة بنجاح',
      });

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding visit:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تسجيل الزيارة',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="سجل الزيارات" subtitle="متابعة وتسجيل زيارات المرضى">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="سجل الزيارات" subtitle="متابعة وتسجيل زيارات المرضى">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="البحث في الزيارات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <ClipboardPlus className="w-4 h-4" />
              تسجيل زيارة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>تسجيل زيارة جديدة</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddVisit(new FormData(e.currentTarget));
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
                <div>
                  <Label htmlFor="date">تاريخ الزيارة</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="services">الخدمة</Label>
                  <Select name="services" required>
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
                <div className="col-span-2">
                  <Label htmlFor="diagnosis">التشخيص</Label>
                  <Textarea id="diagnosis" name="diagnosis" rows={2} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="treatment">العلاج</Label>
                  <Textarea id="treatment" name="treatment" rows={2} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
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
                  تسجيل الزيارة
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Visits Table */}
      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">المريض</TableHead>
              <TableHead className="text-right">الخدمات</TableHead>
              <TableHead className="text-right">التشخيص</TableHead>
              <TableHead className="text-right">الطبيب</TableHead>
              <TableHead className="text-right">التكلفة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVisits.map((visit, index) => {
              const visitServicesList = visitServices[visit.id] || [];
              return (
                <TableRow
                  key={visit.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {visit.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{visit.patients?.name || 'غير محدد'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {visitServicesList.map((vs) => (
                        <span
                          key={vs.id}
                          className="px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-xs"
                        >
                          {vs.services?.name || 'خدمة'}
                        </span>
                      ))}
                      {visitServicesList.length === 0 && (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate text-muted-foreground">
                      {visit.diagnosis || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Stethoscope className="w-4 h-4" />
                      {visit.doctor_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-semibold text-primary">
                      <Banknote className="w-4 h-4" />
                      {Number(visit.total_cost)} درهم
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredVisits.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            لا توجد زيارات مسجلة
          </div>
        )}
      </div>
    </MainLayout>
  );
}
