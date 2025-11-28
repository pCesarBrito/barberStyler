import { User, Appointment, Service, Professional } from '../types';
import { MOCK_SERVICES, MOCK_PROFESSIONALS } from './mockData';

const KEYS = {
  USER: 'barber_user', // Sessão atual
  ALL_USERS: 'barber_users_db', // "Banco de dados" de usuários
  APPOINTMENTS: 'barber_appointments',
  SERVICES: 'barber_services',
  PROFESSIONALS: 'barber_professionals'
};

// Initialize Mock Data
if (!localStorage.getItem(KEYS.SERVICES)) {
  localStorage.setItem(KEYS.SERVICES, JSON.stringify(MOCK_SERVICES));
}
if (!localStorage.getItem(KEYS.PROFESSIONALS)) {
  localStorage.setItem(KEYS.PROFESSIONALS, JSON.stringify(MOCK_PROFESSIONALS));
}

export const db = {
  // Retorna o usuário da sessão atual
  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  
  // Busca um usuário pelo email no "Banco de Dados"
  findUserByEmail: (email: string): User | undefined => {
    const allUsers: User[] = JSON.parse(localStorage.getItem(KEYS.ALL_USERS) || '[]');
    return allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  // Salva na sessão E atualiza o "Banco de Dados"
  saveUser: (user: User): void => {
    // 1. Salva na sessão (Login ativo)
    localStorage.setItem(KEYS.USER, JSON.stringify(user));

    // 2. Persiste na lista de usuários (Simula UPDATE ou INSERT no Backend)
    const allUsers: User[] = JSON.parse(localStorage.getItem(KEYS.ALL_USERS) || '[]');
    const existingIndex = allUsers.findIndex(u => u.id === user.id || u.email === user.email);

    if (existingIndex >= 0) {
      // Atualiza usuário existente mantendo ID original se necessário
      // Garante que o ID da sessão seja o mesmo do banco se achou por email
      const mergedUser = { ...allUsers[existingIndex], ...user, id: allUsers[existingIndex].id }; 
      allUsers[existingIndex] = mergedUser;
      
      // Atualiza a sessão também para garantir consistência de ID
      localStorage.setItem(KEYS.USER, JSON.stringify(mergedUser));
    } else {
      // Cria novo
      allUsers.push(user);
    }

    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));
  },

  logout: (): void => {
    localStorage.removeItem(KEYS.USER);
  },

  getServices: (): Service[] => {
    return JSON.parse(localStorage.getItem(KEYS.SERVICES) || '[]');
  },

  getProfessionals: (): Professional[] => {
    return JSON.parse(localStorage.getItem(KEYS.PROFESSIONALS) || '[]');
  },

  getAppointments: (userId: string): Appointment[] => {
    const all = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
    return all.filter((a: Appointment) => a.userId === userId).sort((a: Appointment, b: Appointment) => b.createdAt - a.createdAt);
  },

  getAllAppointments: (): Appointment[] => {
    return JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
  },

  addAppointment: (appointment: Appointment): void => {
    const all = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
    all.push(appointment);
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(all));
  },

  cancelAppointment: (appointmentId: string): void => {
    const all = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
    const index = all.findIndex((a: Appointment) => a.id === appointmentId);
    if (index >= 0) {
        all[index].status = 'cancelled';
        localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(all));
    }
  },

  toggleFavorite: (serviceId: string, professionalId: string): User | null => {
    const user = db.getUser();
    if (!user) return null;

    const favorites = user.favorites || [];
    const index = favorites.findIndex(f => f.serviceId === serviceId && f.professionalId === professionalId);

    if (index >= 0) {
      favorites.splice(index, 1); // Remove
    } else {
      favorites.push({ serviceId, professionalId }); // Add
    }

    user.favorites = favorites;
    db.saveUser(user); // Isso agora atualiza o "Banco" também
    return user;
  }
};