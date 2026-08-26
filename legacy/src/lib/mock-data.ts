export type Modality = string;

export const MODALITIES: Modality[] = [
  "Musculação", "Funcional", "Corrida", "Yoga", "Alongamento",
  "Natação", "Lutas", "Gestantes", "Terceira idade", "Futevôlei",
  "Aeróbico", "Circuito", "Cross Training", "Pilates", "Calistenia",
  "HIIT", "Mobilidade", "Reabilitação", "Emagrecimento", "Hipertrofia",
  "Treino infantil", "Treino para idosos", "Condicionamento físico",
  "Beach Tennis", "Futebol", "Basquete", "Vôlei", "Ciclismo",
  "Skate", "Surf", "Triathlon", "Dança", "FitDance", "Zumba",
  "Boxe", "Muay Thai", "Jiu-Jitsu", "MMA", "Funcional Kids",
  "Personal para condomínios", "Treino outdoor", "Treino em academia",
  "Treino residencial", "Meditação", "Respiração", "Pós-parto",
  "Preparação física esportiva",
];

export type Trainer = {
  id: string;
  name: string;
  photo: string;
  specialties: Modality[];
  rating: number;
  reviewsCount: number;
  distanceKm: number;
  pricePerHour: number;
  bio: string;
  education: string;
  cref: string;
  crefValidated: boolean;
  availability: string[];
  gallery: string[];
  boosted?: boolean;
  region?: string;
  completedSessions?: number;
  acceptanceRate?: number;
  cancellationRate?: number;
  recurringStudents?: number;
  // Position relative to map (0-100% of viewport)
  posX: number;
  posY: number;
};

const photo = (seed: string) =>
  `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=ffc700,ffd740,ffeb3b`;

export const TRAINERS: Trainer[] = [
  {
    id: "t1", name: "Ricardo Alves", photo: photo("Ricardo"),
    specialties: ["Musculação", "Funcional"], rating: 4.9, reviewsCount: 142,
    distanceKm: 0.8, pricePerHour: 90,
    bio: "Especialista em hipertrofia e condicionamento físico. 8 anos de experiência atendendo clientes em parques e academias.",
    education: "Bacharel em Educação Física - USP", cref: "012345-G/SP", crefValidated: true,
    availability: ["Seg–Sex 06h–11h", "Seg–Sex 17h–21h", "Sáb 07h–12h"],
    gallery: [photo("g1"), photo("g2"), photo("g3"), photo("g4")],
    boosted: true, region: "Barra da Tijuca, RJ",
    completedSessions: 320, acceptanceRate: 0.96, cancellationRate: 0.03, recurringStudents: 18,
    posX: 35, posY: 40,
  },
  {
    id: "t2", name: "Camila Souza", photo: photo("Camila"),
    specialties: ["Yoga", "Alongamento", "Gestantes"], rating: 5.0, reviewsCount: 89,
    distanceKm: 1.2, pricePerHour: 120,
    bio: "Yoga e mobilidade para todos os níveis. Atendimento humanizado e foco em bem-estar.",
    education: "Licenciatura em Educação Física - UFRJ", cref: "098765-G/RJ", crefValidated: true,
    availability: ["Ter, Qui 08h–12h", "Sáb 09h–13h"],
    gallery: [photo("g5"), photo("g6"), photo("g7")],
    boosted: true, region: "Pinheiros, SP",
    completedSessions: 210, acceptanceRate: 0.94, cancellationRate: 0.04, recurringStudents: 14,
    posX: 60, posY: 30,
  },
  {
    id: "t3", name: "Bruno Tavares", photo: photo("Bruno"),
    specialties: ["Lutas", "Funcional", "Circuito"], rating: 4.7, reviewsCount: 56,
    distanceKm: 2.1, pricePerHour: 110,
    bio: "Faixa preta de Muay Thai. Treinos intensos com foco em condicionamento e defesa pessoal.",
    education: "Bacharel em Educação Física - UNESP", cref: "054321-G/SP", crefValidated: true,
    availability: ["Seg–Sex 18h–22h"],
    gallery: [photo("g8"), photo("g9")],
    region: "Vila Mariana, SP",
    completedSessions: 130, acceptanceRate: 0.88, cancellationRate: 0.06, recurringStudents: 7,
    posX: 25, posY: 65,
  },
  {
    id: "t4", name: "Patrícia Lima", photo: photo("Patricia"),
    specialties: ["Corrida", "Aeróbico"], rating: 4.8, reviewsCount: 203,
    distanceKm: 2.8, pricePerHour: 80,
    bio: "Treinadora de corrida de rua. Preparação para 5K, 10K e meia maratona.",
    education: "Pós em Fisiologia do Exercício", cref: "067890-G/SP", crefValidated: true,
    availability: ["Seg, Qua, Sex 05h30–08h", "Sáb 06h–10h"],
    gallery: [photo("g10"), photo("g11"), photo("g12")],
    region: "Ibirapuera, SP",
    completedSessions: 280, acceptanceRate: 0.92, cancellationRate: 0.05, recurringStudents: 12,
    posX: 70, posY: 55,
  },
  {
    id: "t5", name: "André Mendes", photo: photo("Andre"),
    specialties: ["Terceira idade", "Alongamento"], rating: 4.9, reviewsCount: 71,
    distanceKm: 3.5, pricePerHour: 100,
    bio: "Treinos para terceira idade com foco em mobilidade, equilíbrio e qualidade de vida.",
    education: "Mestre em Gerontologia", cref: "011223-G/SP", crefValidated: true,
    availability: ["Seg–Sex 09h–16h"],
    gallery: [photo("g13"), photo("g14")],
    region: "Moema, SP",
    completedSessions: 160, acceptanceRate: 0.9, cancellationRate: 0.04, recurringStudents: 9,
    posX: 50, posY: 75,
  },
  {
    id: "t6", name: "Júlia Ramos", photo: photo("Julia"),
    specialties: ["Futevôlei", "Funcional"], rating: 4.6, reviewsCount: 34,
    distanceKm: 4.2, pricePerHour: 130,
    bio: "Aulas de futevôlei na praia para iniciantes e avançados. Diversão e condicionamento.",
    education: "Bacharel em Educação Física - UFF", cref: "099887-G/RJ", crefValidated: true,
    availability: ["Ter–Dom 07h–11h", "Ter–Dom 16h–19h"],
    gallery: [photo("g15"), photo("g16")],
    region: "Barra, RJ",
    completedSessions: 70, acceptanceRate: 0.85, cancellationRate: 0.08, recurringStudents: 4,
    posX: 80, posY: 70,
  },
];

export function trainerScore(t: Trainer) {
  const accept = t.acceptanceRate ?? 0.85;
  const cancel = t.cancellationRate ?? 0.08;
  const sessions = t.completedSessions ?? 0;
  const recurring = t.recurringStudents ?? 0;
  const boost = t.boosted ? 8 : 0;
  return t.rating * 10 + sessions * 0.05 + recurring * 0.4 + accept * 10 - cancel * 20 + boost;
}

export const REVIEWS = [
  { id: "r1", trainerId: "t1", author: "Marina C.", rating: 5, text: "Treinos excelentes, muito atencioso!", date: "há 2 dias" },
  { id: "r2", trainerId: "t1", author: "João P.", rating: 5, text: "Resultados reais em 3 meses.", date: "há 1 semana" },
  { id: "r3", trainerId: "t1", author: "Lucas M.", rating: 4, text: "Profissional sério e pontual.", date: "há 2 semanas" },
];
