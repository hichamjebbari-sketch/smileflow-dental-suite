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

    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const time = url.searchParams.get('time');

    // التحقق من المدخلات
    if (!date) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Date is required',
          message_ar: 'التاريخ مطلوب'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // التحقق من صحة صيغة التاريخ (YYYY-MM-DD)
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

    // إذا تم تحديد وقت معين - التحقق من توفره
    if (time) {
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

      // البحث عن موعد في هذا الوقت
      const { data: existingAppointment, error } = await supabase
        .from('appointments')
        .select('id, time, status')
        .eq('date', date)
        .eq('time', time)
        .neq('status', 'cancelled')
        .maybeSingle();

      if (error) {
        throw error;
      }

      const isAvailable = !existingAppointment;

      return new Response(
        JSON.stringify({
          success: true,
          available: isAvailable,
          date: date,
          time: time,
          message_ar: isAvailable 
            ? `الموعد متاح في ${date} الساعة ${time}` 
            : `الموعد غير متاح في ${date} الساعة ${time}، يرجى اختيار وقت آخر`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // إذا لم يتم تحديد وقت - إرجاع جميع المواعيد المحجوزة في هذا اليوم
    const { data: bookedAppointments, error } = await supabase
      .from('appointments')
      .select('time, status')
      .eq('date', date)
      .neq('status', 'cancelled')
      .order('time', { ascending: true });

    if (error) {
      throw error;
    }

    // أوقات العمل المتاحة (من 9 صباحاً إلى 9 مساءً)
    const workingHours = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
    ];

    const bookedTimes = (bookedAppointments || []).map(a => a.time.substring(0, 5));
    const availableTimes = workingHours.filter(t => !bookedTimes.includes(t));

    return new Response(
      JSON.stringify({
        success: true,
        date: date,
        booked_times: bookedTimes,
        available_times: availableTimes,
        total_booked: bookedTimes.length,
        total_available: availableTimes.length,
        message_ar: availableTimes.length > 0 
          ? `يوجد ${availableTimes.length} موعد متاح في ${date}` 
          : `لا توجد مواعيد متاحة في ${date}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error checking availability:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message_ar: 'حدث خطأ في التحقق من توفر الموعد'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
