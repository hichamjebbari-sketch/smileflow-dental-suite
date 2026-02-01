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
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Clock, Banknote, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;

const categoryColors: Record<string, string> = {
  'وقائي': 'bg-blue-100 text-blue-700',
  'علاجي': 'bg-green-100 text-green-700',
  'تجميلي': 'bg-purple-100 text-purple-700',
  'جراحي': 'bg-red-100 text-red-700',
  'تعويضي': 'bg-amber-100 text-amber-700',
  'عام': 'bg-muted text-muted-foreground',
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب بيانات الخدمات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (formData: FormData) => {
    try {
      setSubmitting(true);
      
      const serviceData = {
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || null,
        price: parseFloat(formData.get('price') as string),
        duration: parseInt(formData.get('duration') as string),
        category: formData.get('category') as string,
        is_active: true,
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;

        toast({
          title: 'تم التحديث',
          description: 'تم تحديث بيانات الخدمة بنجاح',
        });
      } else {
        const { error } = await supabase
          .from('services')
          .insert(serviceData);

        if (error) throw error;

        toast({
          title: 'تمت الإضافة',
          description: 'تم إضافة الخدمة بنجاح',
        });
      }

      setIsDialogOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ بيانات الخدمة',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الخدمة بنجاح',
      });

      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الخدمة',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      fetchServices();
    } catch (error) {
      console.error('Error toggling service:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الخدمة',
        variant: 'destructive',
      });
    }
  };

  const categories = [...new Set(services.map((s) => s.category))];

  if (loading) {
    return (
      <MainLayout title="الخدمات والأسعار" subtitle="إدارة خدمات العيادة والأسعار">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="الخدمات والأسعار" subtitle="إدارة خدمات العيادة والأسعار">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <span
              key={category}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                categoryColors[category] || 'bg-muted text-muted-foreground'
              )}
            >
              {category}
            </span>
          ))}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingService(null);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة خدمة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddService(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">اسم الخدمة</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingService?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingService?.description || ''}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">السعر (درهم)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingService?.price}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">المدة (دقيقة)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    defaultValue={editingService?.duration}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">الفئة</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={editingService?.category}
                  placeholder="مثال: علاجي، تجميلي، وقائي"
                  required
                />
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
                  {editingService ? 'حفظ التعديلات' : 'إضافة الخدمة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service, index) => (
          <div
            key={service.id}
            className={cn(
              'bg-card rounded-xl shadow-card border border-border/50 p-5 animate-slide-up transition-all',
              !service.is_active && 'opacity-60'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{service.name}</h3>
                <span
                  className={cn(
                    'inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                    categoryColors[service.category] || 'bg-muted text-muted-foreground'
                  )}
                >
                  {service.category}
                </span>
              </div>
              <Switch
                checked={service.is_active}
                onCheckedChange={() => handleToggleActive(service.id, service.is_active)}
              />
            </div>

            {service.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {service.description}
              </p>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Banknote className="w-4 h-4 text-primary" />
                <span className="font-bold text-lg">{Number(service.price)}</span>
                <span className="text-muted-foreground">درهم</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{service.duration} دقيقة</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setEditingService(service);
                  setIsDialogOpen(true);
                }}
              >
                <Edit className="w-4 h-4 ml-1" />
                تعديل
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeleteService(service.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="bg-card rounded-xl p-12 text-center text-muted-foreground">
          لا توجد خدمات مسجلة
        </div>
      )}
    </MainLayout>
  );
}
