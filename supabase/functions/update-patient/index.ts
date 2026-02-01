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

  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
        message_ar: 'طريقة الطلب غير مسموحة، استخدم PUT أو PATCH'
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

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const phone = url.searchParams.get('phone');

    // يجب تحديد المريض بالـ ID أو رقم الهاتف
    if (!id && !phone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Patient identifier required',
          message_ar: 'يجب تحديد المريض بالـ ID أو رقم الهاتف'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // البحث عن المريض
    let query = supabase.from('patients').select('*');
    if (id) {
      query = query.eq('id', id);
    } else if (phone) {
      query = query.eq('phone', phone);
    }

    const { data: existingPatient, error: findError } = await query.maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingPatient) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Patient not found',
          message_ar: 'المريض غير موجود في النظام'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    const body = await req.json();
    const { name, email, date_of_birth, gender, address, medical_history, phone: newPhone } = body;

    // بناء كائن التحديث
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid name',
            message_ar: 'الاسم يجب أن يكون بين 2 و 100 حرف'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      updateData.name = name.trim();
    }

    if (newPhone !== undefined) {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(newPhone.trim())) {
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

      // التحقق من أن الرقم الجديد غير مستخدم
      if (newPhone.trim() !== existingPatient.phone) {
        const { data: phoneExists } = await supabase
          .from('patients')
          .select('id')
          .eq('phone', newPhone.trim())
          .maybeSingle();

        if (phoneExists) {
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
      }
      updateData.phone = newPhone.trim();
    }

    if (email !== undefined) {
      updateData.email = email?.trim() || null;
    }

    if (date_of_birth !== undefined) {
      updateData.date_of_birth = date_of_birth || null;
    }

    if (gender !== undefined) {
      if (gender && gender !== 'male' && gender !== 'female') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid gender',
            message_ar: 'الجنس يجب أن يكون male أو female'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      updateData.gender = gender || null;
    }

    if (address !== undefined) {
      updateData.address = address?.trim() || null;
    }

    if (medical_history !== undefined) {
      updateData.medical_history = medical_history?.trim() || null;
    }

    // التحقق من وجود بيانات للتحديث
    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No data to update',
          message_ar: 'لا توجد بيانات للتحديث'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // تحديث البيانات
    const { data: updatedPatient, error: updateError } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', existingPatient.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // إرسال إشعار للـ webhook - جميع بيانات المريض المحدثة
    const webhookResult = await sendWebhookNotification(supabase, 'update_patient', {
      patient_id: updatedPatient.id,
      patient_name: updatedPatient.name,
      patient_phone: updatedPatient.phone,
      patient_email: updatedPatient.email || '',
      patient_gender: updatedPatient.gender === 'male' ? 'ذكر' : updatedPatient.gender === 'female' ? 'أنثى' : 'غير محدد',
      patient_date_of_birth: updatedPatient.date_of_birth || '',
      patient_address: updatedPatient.address || '',
      patient_medical_history: updatedPatient.medical_history || '',
      registered_date: updatedPatient.created_at,
      updated_at: updatedPatient.updated_at,
    });

    console.log('Webhook result:', webhookResult);

    return new Response(
      JSON.stringify({
        success: true,
        patient: {
          id: updatedPatient.id,
          name: updatedPatient.name,
          phone: updatedPatient.phone,
          email: updatedPatient.email || '',
          gender: updatedPatient.gender === 'male' ? 'ذكر' : updatedPatient.gender === 'female' ? 'أنثى' : 'غير محدد',
          date_of_birth: updatedPatient.date_of_birth || '',
          address: updatedPatient.address || '',
          medical_history: updatedPatient.medical_history || '',
          updated_at: updatedPatient.updated_at,
        },
        message_ar: `تم تحديث بيانات المريض ${updatedPatient.name} بنجاح`,
        webhook_sent: webhookResult.success && !webhookResult.skipped,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error updating patient:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message_ar: 'حدث خطأ أثناء تحديث بيانات المريض'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
