export interface User {
  id: string;
  name: string;
  surname?: string;
  email: string;
  phone?: string;
  birthDate?: string;
  avatar?: string;
  completedOnboarding: boolean;
  favorites?: FavoriteItem[];
}

export interface FavoriteItem {
  serviceId: string;
  professionalId: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  image: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  rating: number;
}

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  professionalId: string;
  date: string; // ISO Date string
  time: string; // HH:mm
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: number;
}

export enum AuthState {
  LOGIN,
  REGISTER,
  RECOVERY,
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ThemeMode = 'light' | 'dark' | 'system' | 'purple';