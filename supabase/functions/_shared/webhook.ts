// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function sendWebhookNotification(
  supabase: SupabaseClient,
  eventType: string,
  data: Record<string, unknown>
) {
  try {
    // جلب إعدادات الـ webhook من قاعدة البيانات
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['webhook_url', 'agent_enabled']);

    if (error) {
      console.error('Error fetching webhook settings:', error);
      return { success: false, error: 'Failed to fetch settings' };
    }

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: { key: string; value: string | null }) => {
      settingsMap[s.key] = s.value || '';
    });

    const webhookUrl = settingsMap.webhook_url;
    const agentEnabled = settingsMap.agent_enabled !== 'false';

    // التحقق من تفعيل الوكيل ووجود رابط webhook
    if (!agentEnabled) {
      console.log('Agent is disabled, skipping webhook');
      return { success: true, skipped: true, reason: 'agent_disabled' };
    }

    if (!webhookUrl || webhookUrl.trim() === '') {
      console.log('No webhook URL configured');
      return { success: true, skipped: true, reason: 'no_webhook_url' };
    }

    // إرسال الإشعار للـ webhook
    console.log(`Sending webhook notification to: ${webhookUrl}`);
    
    const payload = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data: data,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Webhook failed with status: ${response.status}`);
      return { 
        success: false, 
        error: `Webhook returned ${response.status}`,
        statusCode: response.status 
      };
    }

    console.log('Webhook notification sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending webhook:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
