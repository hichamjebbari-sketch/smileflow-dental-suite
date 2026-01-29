import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building2, Bell, Shield, Palette, Globe, Save } from 'lucide-react';

export default function Settings() {
  return (
    <MainLayout title="الإعدادات" subtitle="إدارة إعدادات النظام والعيادة">
      <div className="max-w-4xl space-y-6">
        {/* Clinic Info */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>معلومات العيادة</CardTitle>
                <CardDescription>البيانات الأساسية للعيادة</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clinicName">اسم العيادة</Label>
                <Input id="clinicName" defaultValue="عيادة الأسنان المتقدمة" />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" defaultValue="0112345678" />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" defaultValue="info@dentalclinic.sa" />
              </div>
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input id="address" defaultValue="الرياض، حي النخيل" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>الإشعارات</CardTitle>
                <CardDescription>إعدادات التنبيهات والإشعارات</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تذكير المواعيد</p>
                <p className="text-sm text-muted-foreground">
                  إرسال تذكير للمرضى قبل الموعد
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تأكيد المواعيد</p>
                <p className="text-sm text-muted-foreground">
                  طلب تأكيد الموعد من المريض
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إشعارات النظام</p>
                <p className="text-sm text-muted-foreground">
                  تنبيهات داخل التطبيق
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>الأمان</CardTitle>
                <CardDescription>إعدادات الحماية والخصوصية</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">المصادقة الثنائية</p>
                <p className="text-sm text-muted-foreground">
                  تفعيل التحقق بخطوتين
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تسجيل الدخول التلقائي</p>
                <p className="text-sm text-muted-foreground">
                  البقاء متصلاً لمدة أطول
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="pt-2">
              <Button variant="outline">تغيير كلمة المرور</Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Integration */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Globe className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>تكامل الذكاء الاصطناعي</CardTitle>
                <CardDescription>إعدادات وكيل الذكاء الاصطناعي</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl">رابط Webhook</Label>
              <Input
                id="webhookUrl"
                placeholder="https://n8n.example.com/webhook/..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                رابط n8n للتكامل مع وكيل الذكاء الاصطناعي
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تفعيل الوكيل الذكي</p>
                <p className="text-sm text-muted-foreground">
                  السماح للوكيل بحجز المواعيد وتسجيل المرضى
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                حفظ الإعدادات
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
