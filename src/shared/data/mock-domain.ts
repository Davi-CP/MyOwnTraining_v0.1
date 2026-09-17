export type Trainer = {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  distanceKm: number;
  pricePerHour: number;
  boosted: boolean;
  posX: number;
  posY: number;
  neighborhood: string;
  city: string;
  photo: string;
};

export type Booking = {
  id: string;
  trainerId: string;
  trainerName: string;
  date: string;
  time: string;
  status: "confirmado" | "concluido" | "cancelado";
  value: string;
};

export const modalities = [
  "Funcional",
  "Musculação",
  "Pilates",
  "Corrida",
  "Treino em grupo",
  "Mobilidade",
] as const;

export const trainers: Trainer[] = [
  {
    id: "ana-pereira",
    name: "Ana Pereira",
    specialties: ["Funcional", "Mobilidade"],
    rating: 4.9,
    distanceKm: 1.2,
    pricePerHour: 95,
    boosted: true,
    posX: 28,
    posY: 36,
    neighborhood: "Centro",
    city: "São Paulo",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  },
  {
    id: "rafael-souza",
    name: "Rafael Souza",
    specialties: ["Musculação", "Treino em grupo"],
    rating: 4.8,
    distanceKm: 2.4,
    pricePerHour: 110,
    boosted: false,
    posX: 63,
    posY: 28,
    neighborhood: "Vila Mariana",
    city: "São Paulo",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  },
  {
    id: "camila-oliveira",
    name: "Camila Oliveira",
    specialties: ["Pilates", "Mobilidade"],
    rating: 5.0,
    distanceKm: 3.1,
    pricePerHour: 125,
    boosted: true,
    posX: 48,
    posY: 64,
    neighborhood: "Moema",
    city: "São Paulo",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80",
  },
];

export const upcomingBookings: Booking[] = [
  {
    id: "b1",
    trainerId: "ana-pereira",
    trainerName: "Ana Pereira",
    date: "27/08/2026",
    time: "07:00",
    status: "confirmado",
    value: "R$ 95,00",
  },
  {
    id: "b2",
    trainerId: "rafael-souza",
    trainerName: "Rafael Souza",
    date: "28/08/2026",
    time: "18:30",
    status: "concluido",
    value: "R$ 110,00",
  },
];

export const proMetrics = [
  { label: "Saldo disponível", value: "R$ 1.284,00" },
  { label: "Treinos concluídos", value: "42" },
  { label: "Avaliação média", value: "4,9" },
  { label: "Faltam para recompensa", value: "2" },
] as const;
