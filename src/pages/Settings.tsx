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
import { Building2, Bell, Shield, Languages, Globe, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <MainLayout title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <div className="max-w-4xl space-y-6">
        {/* Language */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Languages className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>{t('settings.language')}</CardTitle>
                <CardDescription>{t('settings.languageDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={language}
              onValueChange={(value) => setLanguage(value as 'ar' | 'fr')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="ar" id="ar" />
                <Label htmlFor="ar" className="cursor-pointer">{t('settings.arabic')}</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="fr" id="fr" />
                <Label htmlFor="fr" className="cursor-pointer">{t('settings.french')}</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        {/* Clinic Info */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>{t('settings.clinicInfo')}</CardTitle>
                <CardDescription>{t('settings.clinicInfoDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clinicName">{t('settings.clinicName')}</Label>
                <Input id="clinicName" defaultValue="عيادة الأسنان المتقدمة" />
              </div>
              <div>
                <Label htmlFor="phone">{t('settings.phone')}</Label>
                <Input id="phone" defaultValue="0112345678" />
              </div>
              <div>
                <Label htmlFor="email">{t('settings.email')}</Label>
                <Input id="email" type="email" defaultValue="info@dentalclinic.sa" />
              </div>
              <div>
                <Label htmlFor="address">{t('settings.address')}</Label>
                <Input id="address" defaultValue="الرياض، حي النخيل" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                {t('settings.saveChanges')}
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
                <CardTitle>{t('settings.notifications')}</CardTitle>
                <CardDescription>{t('settings.notificationsDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.appointmentReminder')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.appointmentReminderDesc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.appointmentConfirmation')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.appointmentConfirmationDesc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.systemNotifications')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.systemNotificationsDesc')}
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
                <CardTitle>{t('settings.security')}</CardTitle>
                <CardDescription>{t('settings.securityDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.twoFactor')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.twoFactorDesc')}
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.autoLogin')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.autoLoginDesc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="pt-2">
              <Button variant="outline">{t('settings.changePassword')}</Button>
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
                <CardTitle>{t('settings.aiIntegration')}</CardTitle>
                <CardDescription>{t('settings.aiIntegrationDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl">{t('settings.webhookUrl')}</Label>
              <Input
                id="webhookUrl"
                placeholder="https://n8n.example.com/webhook/..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('settings.webhookUrlDesc')}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.enableAgent')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.enableAgentDesc')}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                {t('settings.saveSettings')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
