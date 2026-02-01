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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { phone, date, time, notes, duration } = body;

    // التحقق من المدخلات الأساسية
    if (!phone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Phone is required',
          message_ar: 'رقم هاتف المريض مطلوب للبحث عن ملفه'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (!date) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Date is required',
          message_ar: 'تاريخ الموعد مطلوب'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (!time) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Time is required',
          message_ar: 'وقت الموعد مطلوب'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // التحقق من صحة صيغة التاريخ
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid date format',
          message_ar: 'صيغة التاريخ غير صحيحة، يجب أن تكون YYYY-MM-DD'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // التحقق من صحة صيغة الوقت
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid time format',
          message_ar: 'صيغة الوقت غير صحيحة، يجب أن تكون HH:MM (24 ساعة)'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // التحقق من صحة رقم الهاتف
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

    // البحث عن المريض برقم الهاتف
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, name, phone')
      .eq('phone', phone.trim())
      .maybeSingle();

    if (patientError) {
      throw patientError;
    }

    if (!patient) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Patient not found',
          message_ar: `لم يتم العثور على مريض برقم الهاتف ${phone}. يرجى تسجيل المريض أولاً.`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // التحقق من توفر الموعد
    const { data: existingAppointment, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingAppointment) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Time slot not available',
          message_ar: `الموعد في ${date} الساعة ${time} محجوز مسبقاً. يرجى اختيار وقت آخر.`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409,
        }
      );
    }

    // إنشاء الموعد
    const appointmentData = {
      patient_id: patient.id,
      date: date,
      time: time,
      duration: duration || 30,
      status: 'scheduled',
      notes: notes || null,
    };

    const { data: newAppointment, error: insertError } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // إرسال إشعار للـ webhook - جميع بيانات الموعد
    const webhookResult = await sendWebhookNotification(supabase, 'new_appointment', {
      appointment_id: newAppointment.id,
      patient_id: patient.id,
      patient_name: patient.name,
      patient_phone: patient.phone,
      date: newAppointment.date,
      time: newAppointment.time,
      duration: newAppointment.duration,
      status: newAppointment.status,
      notes: newAppointment.notes || '',
      service_id: newAppointment.service_id || '',
      created_at: newAppointment.created_at,
      updated_at: newAppointment.updated_at,
    });

    console.log('Webhook result:', webhookResult);

    return new Response(
      JSON.stringify({
        success: true,
        appointment: {
          id: newAppointment.id,
          patient_id: patient.id,
          patient_name: patient.name,
          patient_phone: patient.phone,
          date: newAppointment.date,
          time: newAppointment.time,
          duration: newAppointment.duration,
          status: newAppointment.status,
          notes: newAppointment.notes,
        },
        message_ar: `تم حجز الموعد بنجاح للمريض ${patient.name} في ${date} الساعة ${time}`,
        webhook_sent: webhookResult.success && !webhookResult.skipped,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );

  } catch (error) {
    console.error('Error booking appointment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message_ar: 'حدث خطأ في حجز الموعد'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
