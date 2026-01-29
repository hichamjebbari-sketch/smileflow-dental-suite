import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockVisits, mockPatients, mockServices } from '@/data/mockData';
import { Visit } from '@/types/clinic';
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
import { ClipboardPlus, Calendar, User, Stethoscope, FileText, Banknote, Search } from 'lucide-react';

export default function Visits() {
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVisits = visits.filter((visit) => {
    const patient = mockPatients.find((p) => p.id === visit.patientId);
    return (
      patient?.name.includes(searchQuery) ||
      visit.diagnosis?.includes(searchQuery) ||
      visit.treatment?.includes(searchQuery)
    );
  });

  const handleAddVisit = (formData: FormData) => {
    const patientId = formData.get('patientId') as string;
    const serviceIds = formData.getAll('services') as string[];

    const selectedServices = mockServices.filter((s) =>
      serviceIds.includes(s.id)
    );
    const totalCost = selectedServices.reduce((sum, s) => sum + s.price, 0);

    const newVisit: Visit = {
      id: Date.now().toString(),
      patientId,
      date: formData.get('date') as string,
      services: selectedServices.map((s) => s.name),
      diagnosis: formData.get('diagnosis') as string,
      treatment: formData.get('treatment') as string,
      notes: formData.get('notes') as string,
      totalCost,
      doctorName: 'د. سارة أحمد',
    };

    setVisits([newVisit, ...visits]);
    setIsDialogOpen(false);
  };

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
                      {mockPatients.map((patient) => (
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
                  <Label htmlFor="services">الخدمات</Label>
                  <Select name="services" required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الخدمات" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
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
                >
                  إلغاء
                </Button>
                <Button type="submit">تسجيل الزيارة</Button>
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
              const patient = mockPatients.find((p) => p.id === visit.patientId);
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
                      <span className="font-medium">{patient?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {visit.services.map((service, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-xs"
                        >
                          {service}
                        </span>
                      ))}
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
                      {visit.doctorName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-semibold text-primary">
                      <Banknote className="w-4 h-4" />
                      {visit.totalCost} ر.س
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
