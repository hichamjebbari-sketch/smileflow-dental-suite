import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { TodayAppointments } from '@/components/dashboard/TodayAppointments';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentPatients } from '@/components/dashboard/RecentPatients';
import { mockDashboardStats, mockAppointments, mockPatients } from '@/data/mockData';
import { Users, Calendar, Clock, Banknote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const todayAppointments = mockAppointments.filter(
    (apt) => apt.date === '2024-01-29'
  );

  return (
    <MainLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title={t('dashboard.totalPatients')}
          value={mockDashboardStats.totalPatients}
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title={t('dashboard.todayAppointments')}
          value={mockDashboardStats.todayAppointments}
          icon={<Calendar className="w-6 h-6" />}
        />
        <StatCard
          title={t('dashboard.pendingAppointments')}
          value={mockDashboardStats.pendingAppointments}
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          title={t('dashboard.monthlyRevenue')}
          value={`${mockDashboardStats.monthlyRevenue.toLocaleString()} ${t('common.currency')}`}
          icon={<Banknote className="w-6 h-6" />}
          trend={{ value: 8, isPositive: true }}
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
          <RecentPatients patients={mockPatients} />
        </div>
      </div>
    </MainLayout>
  );
}
