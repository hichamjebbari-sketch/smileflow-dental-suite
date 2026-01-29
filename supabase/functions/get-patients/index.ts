import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// حساب العمر من تاريخ الميلاد
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const phone = url.searchParams.get('phone');
    const gender = url.searchParams.get('gender');
    const format = url.searchParams.get('format');

    // البحث عن مريض محدد بالـ ID أو رقم الهاتف
    if (id || phone) {
      let query = supabase.from('patients').select('*');
      
      if (id) {
        query = query.eq('id', id);
      } else if (phone) {
        query = query.eq('phone', phone);
      }

      const { data: patient, error } = await query.maybeSingle();

      if (error) {
        throw error;
      }

      if (!patient) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'لم يتم العثور على المريض',
            message_ar: 'المريض غير موجود في النظام'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        );
      }

      // إرجاع بيانات المريض بشكل مبسط للوكيل الذكي
      return new Response(
        JSON.stringify({
          success: true,
          patient: {
            id: patient.id,
            name: patient.name,
            phone: patient.phone,
            email: patient.email || '',
            gender: patient.gender === 'male' ? 'ذكر' : 'أنثى',
            age: patient.date_of_birth ? calculateAge(patient.date_of_birth) : null,
            address: patient.address || '',
            medical_history: patient.medical_history || 'لا يوجد',
            registered_date: patient.created_at,
          },
          message_ar: `تم العثور على ملف المريض: ${patient.name}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // جلب جميع المرضى
    let query = supabase.from('patients').select('*').order('created_at', { ascending: false });

    if (gender) {
      query = query.eq('gender', gender);
    }

    const { data: patients, error } = await query;

    if (error) {
      throw error;
    }

    // Table format - returns array of objects like n8n table view
    if (format === 'sheet') {
      const tableData = (patients || []).map(p => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        email: p.email || '',
        date_of_birth: p.date_of_birth || '',
        gender: p.gender === 'male' ? 'ذكر' : 'أنثى',
        address: p.address || '',
        medical_history: p.medical_history || '',
        created_at: p.created_at,
      }));

      return new Response(
        JSON.stringify(tableData),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Default JSON format
    return new Response(
      JSON.stringify({
        success: true,
        data: patients || [],
        total: patients?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching patients:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
