
import { UserRole, AppointmentStatus, User, Client, Appointment, Product, Service, Transaction } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Ragnar (Admin)', role: UserRole.ADMIN },
  { id: '2', name: 'Bjorn Tattoo', role: UserRole.TATTOOIST },
  { id: '3', name: 'Lagertha Piercing', role: UserRole.PIERCER },
  { id: '4', name: 'Ivar Bar', role: UserRole.BAR },
];

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Tattoo Flash', type: 'TATTOO', basePrice: 450, commission: 40, averageDuration: 120 },
  { id: 's2', name: 'Tattoo Custom', type: 'TATTOO', basePrice: 800, commission: 50, averageDuration: 240 },
  { id: 's3', name: 'Nose Piercing', type: 'PIERCING', basePrice: 150, commission: 30, averageDuration: 30 },
  { id: 's4', name: 'Industrial Piercing', type: 'PIERCING', basePrice: 220, commission: 30, averageDuration: 45 },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Floki Vibe', phone: '(11) 98888-7777', email: 'floki@valhalla.com', birthDate: '1990-05-12', document: '123.456.789-00', classification: 'VIP', points: 150 },
  { id: 'c2', name: 'Ubbe Silva', phone: '(11) 97777-6666', email: 'ubbe@midgard.com', birthDate: '1995-10-20', document: '987.654.321-11', classification: 'Recorrente', points: 45 },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Hidromel Viking', category: 'BAR', subCategory: 'Bebidas', price: 25, cost: 12, stock: 15, minStock: 5 },
  { id: 'p2', name: 'Cerveja Stout', category: 'BAR', subCategory: 'Bebidas', price: 18, cost: 8, stock: 40, minStock: 10 },
  { id: 'p3', name: 'Joia Titânio Argola', category: 'SHOP', subCategory: 'Joias', price: 85, cost: 35, stock: 12, minStock: 5 },
  { id: 'p4', name: 'Camiseta Studio Viking', category: 'SHOP', subCategory: 'Roupas', price: 95, cost: 40, stock: 8, minStock: 3 },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', clientId: 'c1', professionalId: '2', serviceId: 's2', date: '2023-10-27', time: '14:00', duration: 240, status: AppointmentStatus.CONFIRMED, type: 'TATTOO' },
  { id: 'a2', clientId: 'c2', professionalId: '3', serviceId: 's3', date: '2023-10-27', time: '10:30', duration: 30, status: AppointmentStatus.SCHEDULED, type: 'PIERCING' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'INCOME', category: 'TATTOO', amount: 800, date: '2023-10-26', description: 'Fechamento Tattoo Ragnar', paymentMethod: 'PIX' },
  { id: 't2', type: 'INCOME', category: 'BAR', amount: 150, date: '2023-10-26', description: 'Consumo Bar Noite', paymentMethod: 'CARD' },
  { id: 't3', type: 'EXPENSE', category: 'SUPPLIES', amount: 300, date: '2023-10-25', description: 'Compra de agulhas', paymentMethod: 'CARD' },
];
