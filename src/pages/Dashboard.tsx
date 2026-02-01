import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { TodayAppointments } from '@/components/dashboard/TodayAppointments';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentPatients } from '@/components/dashboard/RecentPatients';
import { Users, Calendar, Clock, Banknote, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Patient, Appointment } from '@/types/clinic';

type DBAppointment = Tables<'appointments'> & {
  patients?: { name: string } | null;
  services?: { name: string; duration: number } | null;
};

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  monthlyRevenue: number;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    monthlyRevenue: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

        // Fetch all data in parallel
        const [
          patientsCountRes,
          todayAptsRes,
          pendingAptsRes,
          monthlyRevenueRes,
          recentPatientsRes,
        ] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase
            .from('appointments')
            .select(`
              *,
              patients(name),
              services(name, duration)
            `)
            .eq('date', today)
            .order('time'),
          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .in('status', ['scheduled', 'confirmed']),
          supabase
            .from('visits')
            .select('total_cost')
            .gte('date', startOfMonth),
          supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(4),
        ]);

        // Calculate stats
        const totalPatients = patientsCountRes.count || 0;
        const todayAptsCount = todayAptsRes.data?.length || 0;
        const pendingCount = pendingAptsRes.count || 0;
        const monthlyRevenue = (monthlyRevenueRes.data || []).reduce(
          (sum, v) => sum + Number(v.total_cost || 0),
          0
        );

        setStats({
          totalPatients,
          todayAppointments: todayAptsCount,
          pendingAppointments: pendingCount,
          monthlyRevenue,
        });

        // Format today's appointments
        const formattedAppointments: Appointment[] = (todayAptsRes.data || []).map((apt: DBAppointment) => ({
          id: apt.id,
          patientId: apt.patient_id,
          patientName: apt.patients?.name || 'غير محدد',
          date: apt.date,
          time: apt.time?.slice(0, 5) || '',
          duration: apt.services?.duration || apt.duration || 30,
          serviceId: apt.service_id || '',
          serviceName: apt.services?.name || 'غير محدد',
          status: apt.status as Appointment['status'],
          notes: apt.notes || undefined,
          createdAt: apt.created_at?.split('T')[0] || '',
        }));

        setTodayAppointments(formattedAppointments);

        // Format recent patients
        const formattedPatients: Patient[] = (recentPatientsRes.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          phone: p.phone,
          email: p.email || undefined,
          dateOfBirth: p.date_of_birth || undefined,
          gender: p.gender as 'male' | 'female',
          address: p.address || undefined,
          medicalHistory: p.medical_history || undefined,
          createdAt: p.created_at?.split('T')[0] || '',
          updatedAt: p.updated_at?.split('T')[0] || '',
        }));

        setRecentPatients(formattedPatients);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <MainLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title={t('dashboard.totalPatients')}
          value={stats.totalPatients}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          title={t('dashboard.todayAppointments')}
          value={stats.todayAppointments}
          icon={<Calendar className="w-6 h-6" />}
        />
        <StatCard
          title={t('dashboard.pendingAppointments')}
          value={stats.pendingAppointments}
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          title={t('dashboard.monthlyRevenue')}
          value={`${stats.monthlyRevenue.toLocaleString()} ${t('common.currency')}`}
          icon={<Banknote className="w-6 h-6" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <TodayAppointments appointments={todayAppointments} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions />
          <RecentPatients patients={recentPatients} />
        </div>
      </div>
    </MainLayout>
  );
}
