import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebhookNotification } from "../_shared/webhook.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
        message_ar: 'طريقة الطلب غير مسموحة، استخدم POST'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { name, phone, gender, email, date_of_birth, address, medical_history } = body;

    // التحقق من البيانات المطلوبة
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Name is required',
          message_ar: 'الاسم مطلوب'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Phone is required',
          message_ar: 'رقم الهاتف مطلوب'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // التحقق من صحة رقم الهاتف (أرقام فقط، 10 خانات تبدأ بـ 0)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid phone format',
          message_ar: 'رقم الهاتف غير صحيح، يجب أن يبدأ بـ 0 ويتكون من 10 أرقام'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // التحقق من طول الاسم
    if (name.trim().length < 2 || name.trim().length > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid name length',
          message_ar: 'الاسم يجب أن يكون بين 2 و 100 حرف'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // التحقق من أن رقم الهاتف غير مستخدم
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('phone', phone.trim())
      .maybeSingle();

    if (existingPatient) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Phone already exists',
          message_ar: 'رقم الهاتف مسجل مسبقاً لمريض آخر'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409,
        }
      );
    }

    // إنشاء مريض جديد في قاعدة البيانات
    const newPatientData = {
      name: name.trim(),
      phone: phone.trim(),
      gender: gender === 'male' || gender === 'female' ? gender : null,
      email: email?.trim() || null,
      date_of_birth: date_of_birth || null,
      address: address?.trim() || null,
      medical_history: medical_history?.trim() || null,
    };

    const { data: newPatient, error } = await supabase
      .from('patients')
      .insert(newPatientData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // إرسال إشعار للـ webhook - جميع بيانات المريض
    const webhookResult = await sendWebhookNotification(supabase, 'new_patient', {
      patient_id: newPatient.id,
      patient_name: newPatient.name,
      patient_phone: newPatient.phone,
      patient_email: newPatient.email || '',
      patient_gender: newPatient.gender === 'male' ? 'ذكر' : newPatient.gender === 'female' ? 'أنثى' : 'غير محدد',
      patient_date_of_birth: newPatient.date_of_birth || '',
      patient_address: newPatient.address || '',
      patient_medical_history: newPatient.medical_history || '',
      registered_date: newPatient.created_at,
      updated_at: newPatient.updated_at,
    });

    console.log('Webhook result:', webhookResult);

    return new Response(
      JSON.stringify({
        success: true,
        patient: {
          id: newPatient.id,
          name: newPatient.name,
          phone: newPatient.phone,
          email: newPatient.email || '',
          gender: newPatient.gender === 'male' ? 'ذكر' : newPatient.gender === 'female' ? 'أنثى' : 'غير محدد',
          registered_date: newPatient.created_at,
        },
        message_ar: `تم تسجيل المريض ${newPatient.name} بنجاح`,
        webhook_sent: webhookResult.success && !webhookResult.skipped,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );
  } catch (error) {
    console.error('Error adding patient:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message_ar: 'حدث خطأ أثناء تسجيل المريض'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
