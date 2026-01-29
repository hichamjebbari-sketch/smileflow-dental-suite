import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockPatients } from '@/data/mockData';
import { Patient } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Search, UserPlus, Phone, Mail, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.includes(searchQuery) ||
      patient.phone.includes(searchQuery) ||
      patient.email?.includes(searchQuery)
  );

  const handleAddPatient = (formData: FormData) => {
    const newPatient: Patient = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      gender: formData.get('gender') as 'male' | 'female',
      address: formData.get('address') as string,
      medicalHistory: formData.get('medicalHistory') as string,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setPatients([newPatient, ...patients]);
    setIsDialogOpen(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = (id: string) => {
    setPatients(patients.filter((p) => p.id !== id));
  };

  return (
    <MainLayout title="إدارة المرضى" subtitle="عرض وإدارة ملفات المرضى">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن مريض..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              إضافة مريض جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddPatient(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingPatient?.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editingPatient?.phone}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingPatient?.email}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">تاريخ الميلاد</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    defaultValue={editingPatient?.dateOfBirth}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">الجنس</Label>
                  <Select name="gender" defaultValue={editingPatient?.gender || 'male'}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editingPatient?.address}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="medicalHistory">التاريخ المرضي</Label>
                  <Textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    defaultValue={editingPatient?.medicalHistory}
                    rows={3}
                  />
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
                <Button type="submit">
                  {editingPatient ? 'حفظ التعديلات' : 'إضافة المريض'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Patients Table */}
      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">المريض</TableHead>
              <TableHead className="text-right">رقم الهاتف</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الجنس</TableHead>
              <TableHead className="text-right">تاريخ التسجيل</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient, index) => (
              <TableRow
                key={patient.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                        {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{patient.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    {patient.phone}
                  </div>
                </TableCell>
                <TableCell>
                  {patient.email && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {patient.email}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      patient.gender === 'male'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-pink-100 text-pink-700'
                    )}
                  >
                    {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.createdAt}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingPatient(patient);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeletePatient(patient.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredPatients.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            لا توجد نتائج للبحث
          </div>
        )}
      </div>
    </MainLayout>
  );
}
