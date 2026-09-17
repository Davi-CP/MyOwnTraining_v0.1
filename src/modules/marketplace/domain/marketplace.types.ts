export type Trainer = {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  distanceKm: number | null;
  pricePerHour: number;
  boosted: boolean;
  neighborhood: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  photo: string | null;
};

export type BookingStatus =
  | "pendente"
  | "confirmado"
  | "em_andamento"
  | "concluido"
  | "cancelado"
  | "nao_compareceu";

export type Booking = {
  id: string;
  trainerId: string;
  trainerName: string;
  datetime: string;
  status: BookingStatus;
  value: number;
};

export type ProSession = {
  id: string;
  clienteNome: string;
  datetime: string;
  status: BookingStatus;
  value: number;
};

export type ProDashboard = {
  nomeCompleto: string;
  avaliacao: number;
  saldoDisponivel: number;
  saldoPendente: number;
  treinosConcluidos: number;
  proximosAtendimentos: number;
  proximos: ProSession[];
};

export type AdminMetrics = {
  usuarios: number;
  crefPendentes: number;
  chamadosAbertos: number;
};