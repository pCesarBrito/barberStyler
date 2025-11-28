import { Professional, Service } from '../types';

export const MOCK_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Corte de Cabelo',
    description: 'Corte moderno com acabamento na navalha e lavagem.',
    price: 45.00,
    durationMinutes: 45,
    image: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 's2',
    name: 'Barba Terapia',
    description: 'Modelagem de barba com toalha quente e hidratação.',
    price: 35.00,
    durationMinutes: 30,
    image: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: 's3',
    name: 'Combo Completo',
    description: 'Corte de cabelo + Barba + Sobrancelha.',
    price: 75.00,
    durationMinutes: 75,
    image: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: 's4',
    name: 'Pigmentação',
    description: 'Camuflagem de falhas na barba ou cabelo.',
    price: 50.00,
    durationMinutes: 40,
    image: 'https://picsum.photos/200/200?random=4'
  }
];

export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: 'p1',
    name: 'Carlos "The Barber"',
    specialty: 'Degradê & Navalha',
    rating: 4.9,
    avatar: 'https://picsum.photos/100/100?random=10'
  },
  {
    id: 'p2',
    name: 'André Style',
    specialty: 'Barba & Colorimetria',
    rating: 4.8,
    avatar: 'https://picsum.photos/100/100?random=11'
  },
  {
    id: 'p3',
    name: 'Mariana Cortes',
    specialty: 'Cortes Clássicos',
    rating: 5.0,
    avatar: 'https://picsum.photos/100/100?random=12'
  }
];