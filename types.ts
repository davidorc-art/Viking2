
export enum UserRole {
  ADMIN = 'ADMIN',
  TATTOOIST = 'TATTOOIST',
  PIERCER = 'PIERCER',
  BAR = 'BAR',
  SHOP = 'SHOP',
  CASHIER = 'CASHIER'
}

export enum AppointmentStatus {
  SCHEDULED = 'Agendado',
  CONFIRMED = 'Confirmado',
  IN_PROGRESS = 'Em Atendimento',
  FINISHED = 'Finalizado',
  CANCELLED = 'Cancelado',
  NO_SHOW = 'Falta'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  document: string;
  classification: 'Novo' | 'Recorrente' | 'VIP';
  points: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: AppointmentStatus;
  type: 'TATTOO' | 'PIERCING';
}

export interface Product {
  id: string;
  name: string;
  category: 'BAR' | 'SHOP';
  subCategory: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
}

export interface Service {
  id: string;
  name: string;
  type: 'TATTOO' | 'PIERCING';
  basePrice: number;
  commission: number; // percentage
  averageDuration: number; // minutes
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'TATTOO' | 'PIERCING' | 'BAR' | 'SHOP' | 'RENT' | 'SUPPLIES' | 'BILLS';
  amount: number;
  date: string;
  description: string;
  paymentMethod: 'CASH' | 'PIX' | 'CARD';
}
