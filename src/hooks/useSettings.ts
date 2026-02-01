import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WebhookTestResult {
  success: boolean;
  message_ar: string;
  status_code?: number;
  response_body?: string;
  error?: string;
}

interface Settings {
  webhook_url: string;
  agent_enabled: boolean;
  clinic_name: string;
  clinic_phone: string;
  clinic_email: string;
  clinic_address: string;
}

const defaultSettings: Settings = {
  webhook_url: '',
  agent_enabled: true,
  clinic_name: 'عيادة الأسنان المتقدمة',
  clinic_phone: '0112345678',
  clinic_email: 'info@dentalclinic.sa',
  clinic_address: 'الرياض، حي النخيل',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach((item: { key: string; value: string | null }) => {
          settingsMap[item.key] = item.value || '';
        });

        setSettings({
          webhook_url: settingsMap.webhook_url || '',
          agent_enabled: settingsMap.agent_enabled !== 'false',
          clinic_name: settingsMap.clinic_name || defaultSettings.clinic_name,
          clinic_phone: settingsMap.clinic_phone || defaultSettings.clinic_phone,
          clinic_email: settingsMap.clinic_email || defaultSettings.clinic_email,
          clinic_address: settingsMap.clinic_address || defaultSettings.clinic_address,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: keyof Settings, value: string | boolean) => {
    const stringValue = typeof value === 'boolean' ? value.toString() : value;
    
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: stringValue })
        .eq('key', key);

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        [key]: value,
      }));

      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  };

  const saveClinicSettings = async (clinicData: Partial<Settings>) => {
    setSaving(true);
    try {
      const updates = Object.entries(clinicData).map(([key, value]) => 
        supabase
          .from('settings')
          .update({ value: typeof value === 'boolean' ? value.toString() : value })
          .eq('key', key)
      );

      await Promise.all(updates);

      setSettings(prev => ({
        ...prev,
        ...clinicData,
      }));

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الإعدادات بنجاح',
      });

      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveWebhookSettings = async (webhookUrl: string, agentEnabled: boolean) => {
    setSaving(true);
    try {
      await Promise.all([
        supabase.from('settings').update({ value: webhookUrl }).eq('key', 'webhook_url'),
        supabase.from('settings').update({ value: agentEnabled.toString() }).eq('key', 'agent_enabled'),
      ]);

      setSettings(prev => ({
        ...prev,
        webhook_url: webhookUrl,
        agent_enabled: agentEnabled,
      }));

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات الربط بنجاح',
      });

      return true;
    } catch (error) {
      console.error('Error saving webhook settings:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ إعدادات الربط',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const testWebhook = async (): Promise<WebhookTestResult> => {
    if (!settings.webhook_url) {
      const result: WebhookTestResult = {
        success: false,
        message_ar: 'يرجى إدخال رابط الـ webhook أولاً',
      };
      toast({
        title: 'خطأ',
        description: result.message_ar,
        variant: 'destructive',
      });
      return result;
    }

    try {
      // استخدام Edge Function لتجنب مشاكل CORS
      const { data, error } = await supabase.functions.invoke('test-webhook');

      if (error) {
        throw error;
      }

      const result = data as WebhookTestResult;

      if (result.success) {
        const details = `Status: ${result.status_code} | Response: ${result.response_body?.substring(0, 80) || 'N/A'}`;
        toast({
          title: 'نجح الاتصال ✓',
          description: `${result.message_ar}\n${details}`,
        });
      } else {
        const details = result.status_code 
          ? `Status: ${result.status_code} | Response: ${result.response_body?.substring(0, 80) || 'N/A'}`
          : result.error || '';
        toast({
          title: 'فشل الاتصال',
          description: `${result.message_ar}${details ? '\n' + details : ''}`,
          variant: 'destructive',
        });
      }

      return result;
    } catch (error) {
      console.error('Error testing webhook:', error);
      const result: WebhookTestResult = {
        success: false,
        message_ar: 'حدث خطأ أثناء اختبار الـ webhook',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      toast({
        title: 'خطأ',
        description: result.message_ar,
        variant: 'destructive',
      });
      return result;
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSetting,
    saveClinicSettings,
    saveWebhookSettings,
    testWebhook,
    refetch: fetchSettings,
  };
}
