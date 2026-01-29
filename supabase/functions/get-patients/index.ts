import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Mock patients data
const patients = [
  {
    id: '1',
    name: 'أحمد محمد العلي',
    phone: '0501234567',
    email: 'ahmed@email.com',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    address: 'الرياض، حي النخيل',
    medicalHistory: 'لا يوجد أمراض مزمنة',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'فاطمة عبدالله السعيد',
    phone: '0559876543',
    email: 'fatima@email.com',
    dateOfBirth: '1990-07-22',
    gender: 'female',
    address: 'الرياض، حي الياسمين',
    medicalHistory: 'حساسية من البنسلين',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'خالد سعود المطيري',
    phone: '0541112233',
    email: 'khaled@email.com',
    dateOfBirth: '1978-11-08',
    gender: 'male',
    address: 'الرياض، حي الملقا',
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    name: 'نورة محمد الشمري',
    phone: '0567778899',
    email: 'noura@email.com',
    dateOfBirth: '1995-04-12',
    gender: 'female',
    address: 'الرياض، حي الربوة',
    createdAt: '2024-02-10',
  },
];

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
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const phone = url.searchParams.get('phone');
    const gender = url.searchParams.get('gender');
    const format = url.searchParams.get('format');

    // البحث عن مريض محدد بالـ ID أو رقم الهاتف
    if (id || phone) {
      const patient = patients.find(p => 
        (id && p.id === id) || (phone && p.phone === phone)
      );

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
            age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : null,
            address: patient.address || '',
            medical_history: patient.medicalHistory || 'لا يوجد',
            registered_date: patient.createdAt,
          },
          message_ar: `تم العثور على ملف المريض: ${patient.name}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    let filteredPatients = [...patients];

    if (gender) {
      filteredPatients = filteredPatients.filter(p => p.gender === gender);
    }

    // Table format - returns array of objects like n8n table view
    if (format === 'sheet') {
      const tableData = filteredPatients.map(p => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        email: p.email || '',
        date_of_birth: p.dateOfBirth || '',
        gender: p.gender === 'male' ? 'ذكر' : 'أنثى',
        address: p.address || '',
        medical_history: p.medicalHistory || '',
        created_at: p.createdAt,
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
        data: filteredPatients,
        total: filteredPatients.length,
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
