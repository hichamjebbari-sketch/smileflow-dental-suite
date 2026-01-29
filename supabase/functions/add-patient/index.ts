import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// قائمة المرضى المؤقتة (في الواقع ستكون في قاعدة البيانات)
const patients: Array<{
  id: string;
  name: string;
  phone: string;
  gender?: string;
  createdAt: string;
}> = [];

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
    const body = await req.json();
    const { name, phone, gender } = body;

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

    // التحقق من صحة رقم الهاتف (أرقام فقط، 10 خانات تبدأ بـ 05)
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid phone format',
          message_ar: 'رقم الهاتف غير صحيح، يجب أن يبدأ بـ 05 ويتكون من 10 أرقام'
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

    // إنشاء مريض جديد
    const newPatient = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
      gender: gender === 'male' || gender === 'female' ? gender : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // في الواقع سيتم حفظه في قاعدة البيانات
    patients.push(newPatient);

    return new Response(
      JSON.stringify({
        success: true,
        patient: {
          id: newPatient.id,
          name: newPatient.name,
          phone: newPatient.phone,
          gender: newPatient.gender === 'male' ? 'ذكر' : newPatient.gender === 'female' ? 'أنثى' : 'غير محدد',
          registered_date: newPatient.createdAt,
        },
        message_ar: `تم تسجيل المريض ${newPatient.name} بنجاح`
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
