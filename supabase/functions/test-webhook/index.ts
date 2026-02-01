import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // جلب إعدادات الـ webhook من قاعدة البيانات
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['webhook_url', 'agent_enabled']);

    if (error) {
      throw error;
    }

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: { key: string; value: string | null }) => {
      settingsMap[s.key] = s.value || '';
    });

    const webhookUrl = settingsMap.webhook_url;
    const agentEnabled = settingsMap.agent_enabled !== 'false';

    if (!agentEnabled) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Agent is disabled',
          message_ar: 'الوكيل معطل. قم بتفعيله من الإعدادات.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (!webhookUrl || webhookUrl.trim() === '') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No webhook URL configured',
          message_ar: 'لم يتم تكوين رابط الـ webhook.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // إرسال طلب الاختبار
    console.log(`Testing webhook at: ${webhookUrl}`);
    
    const payload = {
      type: 'test',
      message: 'اختبار الاتصال من نظام العيادة',
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`Webhook response: ${response.status} - ${responseText}`);

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Webhook returned ${response.status}`,
          message_ar: `فشل الاتصال: الـ webhook أرجع حالة ${response.status}`,
          status_code: response.status,
          response_body: responseText,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // نرجع 200 لأن الوظيفة نفسها نجحت، لكن الـ webhook فشل
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_ar: 'تم الاتصال بنجاح! الـ webhook يعمل بشكل صحيح.',
        status_code: response.status,
        response_body: responseText,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error testing webhook:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message_ar: 'حدث خطأ أثناء اختبار الـ webhook',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
