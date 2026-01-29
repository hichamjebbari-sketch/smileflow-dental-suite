import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.patients': 'المرضى',
    'nav.appointments': 'المواعيد',
    'nav.services': 'الخدمات',
    'nav.visits': 'الزيارات',
    'nav.aiAssistant': 'المساعد الذكي',
    'nav.settings': 'الإعدادات',
    'nav.collapse': 'طي القائمة',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.subtitle': 'مرحباً بك في نظام إدارة العيادة',
    'dashboard.totalPatients': 'إجمالي المرضى',
    'dashboard.todayAppointments': 'مواعيد اليوم',
    'dashboard.pendingAppointments': 'مواعيد قيد الانتظار',
    'dashboard.monthlyRevenue': 'إيرادات الشهر',
    'dashboard.todayAppointmentsList': 'مواعيد اليوم',
    'dashboard.viewAll': 'عرض الكل',
    'dashboard.noAppointments': 'لا توجد مواعيد اليوم',
    'dashboard.quickActions': 'إجراءات سريعة',
    'dashboard.newPatient': 'مريض جديد',
    'dashboard.newAppointment': 'موعد جديد',
    'dashboard.recordVisit': 'تسجيل زيارة',
    'dashboard.aiAssistant': 'المساعد الذكي',
    'dashboard.recentPatients': 'المرضى الجدد',
    
    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث...',
    'common.minutes': 'دقيقة',
    'common.currency': 'درهم',
    
    // Status
    'status.scheduled': 'مجدول',
    'status.confirmed': 'مؤكد',
    'status.completed': 'مكتمل',
    'status.cancelled': 'ملغي',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.subtitle': 'إدارة إعدادات النظام والعيادة',
    'settings.clinicInfo': 'معلومات العيادة',
    'settings.clinicInfoDesc': 'البيانات الأساسية للعيادة',
    'settings.clinicName': 'اسم العيادة',
    'settings.phone': 'رقم الهاتف',
    'settings.email': 'البريد الإلكتروني',
    'settings.address': 'العنوان',
    'settings.saveChanges': 'حفظ التغييرات',
    'settings.notifications': 'الإشعارات',
    'settings.notificationsDesc': 'إعدادات التنبيهات والإشعارات',
    'settings.appointmentReminder': 'تذكير المواعيد',
    'settings.appointmentReminderDesc': 'إرسال تذكير للمرضى قبل الموعد',
    'settings.appointmentConfirmation': 'تأكيد المواعيد',
    'settings.appointmentConfirmationDesc': 'طلب تأكيد الموعد من المريض',
    'settings.systemNotifications': 'إشعارات النظام',
    'settings.systemNotificationsDesc': 'تنبيهات داخل التطبيق',
    'settings.security': 'الأمان',
    'settings.securityDesc': 'إعدادات الحماية والخصوصية',
    'settings.twoFactor': 'المصادقة الثنائية',
    'settings.twoFactorDesc': 'تفعيل التحقق بخطوتين',
    'settings.autoLogin': 'تسجيل الدخول التلقائي',
    'settings.autoLoginDesc': 'البقاء متصلاً لمدة أطول',
    'settings.changePassword': 'تغيير كلمة المرور',
    'settings.aiIntegration': 'تكامل الذكاء الاصطناعي',
    'settings.aiIntegrationDesc': 'إعدادات وكيل الذكاء الاصطناعي',
    'settings.webhookUrl': 'رابط Webhook',
    'settings.webhookUrlDesc': 'رابط n8n للتكامل مع وكيل الذكاء الاصطناعي',
    'settings.enableAgent': 'تفعيل الوكيل الذكي',
    'settings.enableAgentDesc': 'السماح للوكيل بحجز المواعيد وتسجيل المرضى',
    'settings.saveSettings': 'حفظ الإعدادات',
    'settings.language': 'اللغة',
    'settings.languageDesc': 'اختر لغة واجهة النظام',
    'settings.arabic': 'العربية',
    'settings.french': 'الفرنسية',
    
    // Header
    'header.myAccount': 'حسابي',
    'header.profile': 'الملف الشخصي',
    'header.logout': 'تسجيل الخروج',
    
    // Clinic
    'clinic.name': 'عيادة الأسنان',
    'clinic.system': 'نظام الإدارة',
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.patients': 'Patients',
    'nav.appointments': 'Rendez-vous',
    'nav.services': 'Services',
    'nav.visits': 'Visites',
    'nav.aiAssistant': 'Assistant IA',
    'nav.settings': 'Paramètres',
    'nav.collapse': 'Réduire le menu',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.subtitle': 'Bienvenue dans le système de gestion de la clinique',
    'dashboard.totalPatients': 'Total des patients',
    'dashboard.todayAppointments': 'Rendez-vous aujourd\'hui',
    'dashboard.pendingAppointments': 'Rendez-vous en attente',
    'dashboard.monthlyRevenue': 'Revenus mensuels',
    'dashboard.todayAppointmentsList': 'Rendez-vous du jour',
    'dashboard.viewAll': 'Voir tout',
    'dashboard.noAppointments': 'Aucun rendez-vous aujourd\'hui',
    'dashboard.quickActions': 'Actions rapides',
    'dashboard.newPatient': 'Nouveau patient',
    'dashboard.newAppointment': 'Nouveau rendez-vous',
    'dashboard.recordVisit': 'Enregistrer visite',
    'dashboard.aiAssistant': 'Assistant IA',
    'dashboard.recentPatients': 'Patients récents',
    
    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher...',
    'common.minutes': 'minutes',
    'common.currency': 'DH',
    
    // Status
    'status.scheduled': 'Planifié',
    'status.confirmed': 'Confirmé',
    'status.completed': 'Terminé',
    'status.cancelled': 'Annulé',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Gérer les paramètres du système et de la clinique',
    'settings.clinicInfo': 'Informations de la clinique',
    'settings.clinicInfoDesc': 'Données de base de la clinique',
    'settings.clinicName': 'Nom de la clinique',
    'settings.phone': 'Téléphone',
    'settings.email': 'Email',
    'settings.address': 'Adresse',
    'settings.saveChanges': 'Enregistrer les modifications',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Paramètres des alertes et notifications',
    'settings.appointmentReminder': 'Rappel de rendez-vous',
    'settings.appointmentReminderDesc': 'Envoyer un rappel aux patients avant le rendez-vous',
    'settings.appointmentConfirmation': 'Confirmation de rendez-vous',
    'settings.appointmentConfirmationDesc': 'Demander confirmation au patient',
    'settings.systemNotifications': 'Notifications système',
    'settings.systemNotificationsDesc': 'Alertes dans l\'application',
    'settings.security': 'Sécurité',
    'settings.securityDesc': 'Paramètres de protection et confidentialité',
    'settings.twoFactor': 'Authentification à deux facteurs',
    'settings.twoFactorDesc': 'Activer la vérification en deux étapes',
    'settings.autoLogin': 'Connexion automatique',
    'settings.autoLoginDesc': 'Rester connecté plus longtemps',
    'settings.changePassword': 'Changer le mot de passe',
    'settings.aiIntegration': 'Intégration IA',
    'settings.aiIntegrationDesc': 'Paramètres de l\'agent IA',
    'settings.webhookUrl': 'URL Webhook',
    'settings.webhookUrlDesc': 'Lien n8n pour l\'intégration avec l\'agent IA',
    'settings.enableAgent': 'Activer l\'agent intelligent',
    'settings.enableAgentDesc': 'Permettre à l\'agent de réserver des rendez-vous et d\'enregistrer des patients',
    'settings.saveSettings': 'Enregistrer les paramètres',
    'settings.language': 'Langue',
    'settings.languageDesc': 'Choisissez la langue de l\'interface',
    'settings.arabic': 'Arabe',
    'settings.french': 'Français',
    
    // Header
    'header.myAccount': 'Mon compte',
    'header.profile': 'Profil',
    'header.logout': 'Déconnexion',
    
    // Clinic
    'clinic.name': 'Clinique Dentaire',
    'clinic.system': 'Système de gestion',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
