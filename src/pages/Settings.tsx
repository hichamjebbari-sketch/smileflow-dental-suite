import { useState, useEffect } from 'react';
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
import { Building2, Bell, Shield, Languages, Globe, Save, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettings } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const { settings, loading, saving, saveClinicSettings, saveWebhookSettings, testWebhook } = useSettings();

  // Local state for form inputs
  const [clinicName, setClinicName] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [testingWebhook, setTestingWebhook] = useState(false);

  // Sync local state with fetched settings
  useEffect(() => {
    if (!loading) {
      setClinicName(settings.clinic_name);
      setClinicPhone(settings.clinic_phone);
      setClinicEmail(settings.clinic_email);
      setClinicAddress(settings.clinic_address);
      setWebhookUrl(settings.webhook_url);
      setAgentEnabled(settings.agent_enabled);
    }
  }, [loading, settings]);

  const handleSaveClinic = async () => {
    await saveClinicSettings({
      clinic_name: clinicName,
      clinic_phone: clinicPhone,
      clinic_email: clinicEmail,
      clinic_address: clinicAddress,
    });
  };

  const handleSaveWebhook = async () => {
    await saveWebhookSettings(webhookUrl, agentEnabled);
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    await testWebhook();
    setTestingWebhook(false);
  };

  if (loading) {
    return (
      <MainLayout title={t('settings.title')} subtitle={t('settings.subtitle')}>
        <div className="max-w-4xl space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="shadow-card border-border/50">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

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
                <Input 
                  id="clinicName" 
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">{t('settings.phone')}</Label>
                <Input 
                  id="phone" 
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">{t('settings.email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={clinicEmail}
                  onChange={(e) => setClinicEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">{t('settings.address')}</Label>
                <Input 
                  id="address" 
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveClinic} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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

        {/* AI Integration - Webhook */}
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
              <div className="flex gap-2">
                <Input
                  id="webhookUrl"
                  placeholder="https://n8n.example.com/webhook/..."
                  className="font-mono text-sm flex-1"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  onClick={handleTestWebhook}
                  disabled={testingWebhook || !webhookUrl}
                  className="gap-2"
                >
                  {testingWebhook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  اختبار
                </Button>
              </div>
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
              <Switch 
                checked={agentEnabled}
                onCheckedChange={setAgentEnabled}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveWebhook} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('settings.saveSettings')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
