export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender: 'male' | 'female';
  address?: string;
  medicalHistory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  serviceId: string;
  serviceName: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  category: string;
}

export interface Visit {
  id: string;
  patientId: string;
  appointmentId?: string;
  date: string;
  services: string[];
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  totalCost: number;
  doctorName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'receptionist';
  avatar?: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  monthlyRevenue: number;
}
