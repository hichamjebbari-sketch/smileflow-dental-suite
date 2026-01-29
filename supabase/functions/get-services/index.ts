import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Mock services data (same as mockData.ts)
const services = [
  {
    id: '1',
    name: 'فحص وتنظيف الأسنان',
    description: 'فحص شامل مع تنظيف احترافي',
    price: 200,
    duration: 30,
    isActive: true,
    category: 'وقائي',
  },
  {
    id: '2',
    name: 'حشو الأسنان',
    description: 'حشو تجميلي بمواد عالية الجودة',
    price: 350,
    duration: 45,
    isActive: true,
    category: 'علاجي',
  },
  {
    id: '3',
    name: 'تبييض الأسنان',
    description: 'تبييض بتقنية الليزر',
    price: 1500,
    duration: 60,
    isActive: true,
    category: 'تجميلي',
  },
  {
    id: '4',
    name: 'خلع ضرس العقل',
    description: 'خلع جراحي لضرس العقل',
    price: 800,
    duration: 45,
    isActive: true,
    category: 'جراحي',
  },
  {
    id: '5',
    name: 'تركيب تاج',
    description: 'تاج خزفي عالي الجودة',
    price: 2000,
    duration: 60,
    isActive: true,
    category: 'تعويضي',
  },
  {
    id: '6',
    name: 'علاج العصب',
    description: 'علاج جذور الأسنان',
    price: 1200,
    duration: 90,
    isActive: true,
    category: 'علاجي',
  },
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const activeOnly = url.searchParams.get('active') === 'true';
    const format = url.searchParams.get('format'); // 'sheet' for Google Sheets format

    let filteredServices = [...services];

    // Filter by category if provided
    if (category) {
      filteredServices = filteredServices.filter(s => s.category === category);
    }

    // Filter active services only if requested
    if (activeOnly) {
      filteredServices = filteredServices.filter(s => s.isActive);
    }

    // Google Sheets / Table format
    if (format === 'sheet') {
      const headers = ['الرقم', 'اسم الخدمة', 'الوصف', 'السعر (درهم)', 'المدة (دقيقة)', 'الفئة', 'الحالة'];
      const rows = filteredServices.map(s => [
        s.id,
        s.name,
        s.description || '',
        s.price,
        s.duration,
        s.category,
        s.isActive ? 'نشط' : 'غير نشط'
      ]);

      return new Response(
        JSON.stringify({
          success: true,
          headers: headers,
          rows: rows,
          total: rows.length,
        }),
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
        data: filteredServices,
        total: filteredServices.length,
        categories: [...new Set(services.map(s => s.category))],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching services:', error);
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
