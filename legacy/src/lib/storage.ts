import { useEffect, useState, useCallback } from "react";

const EVENT = "mot-storage";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }));
  } catch {
    /* ignore */
  }
}

export function useStored<T>(key: string, fallback: T) {
  // Always start with fallback to keep SSR markup === first client render.
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    setValue(read(key, fallback));
    const sync = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key: string } | undefined;
      if (!detail || detail.key === key) setValue(read(key, fallback));
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        write(key, next);
        return next;
      });
    },
    [key],
  );
  return [value, set] as const;
}

// ---------- Domain types ----------

export type ChatMessage = { id: string; from: "me" | "them"; text: string; ts: number };
export type Review = {
  id: string;
  trainerId: string;
  rating: number;
  text: string;
  date: string;
  author: string;
};
export type Personal = {
  name: string;
  birth: string;
  gender: string;
  phone: string;
  email: string;
  doc: string;
  address: string;
  city: string;
  state: string;
};
export type Session = {
  id: string;
  trainerId: string;
  date: string;
  time: string;
  duration: number;
  place: string;
  value: number;
  status: "upcoming" | "completed";
  quantity?: number;
};
export type PaymentMethod = {
  id: string;
  type: "credit" | "debit" | "pix";
  name: string;
  last4: string;
  exp: string;
};

export const KEYS = {
  favorites: "mot:favorites",
  chats: "mot:chats",
  reviews: "mot:reviews",
  personal: "mot:personal",
  sessions: "mot:sessions",
  paymentMethods: "mot:paymentMethods",
  proRequests: "mot:proRequests",
  proSchedules: "mot:proSchedules",
  proHistory: "mot:proHistory",
  proStudentReviews: "mot:proStudentReviews",
  proProfile: "mot:proProfile",
  proChats: "mot:proChats",
  proBoost: "mot:proBoost",
  safetyReports: "mot:safetyReports",
  blockedUsers: "mot:blockedUsers",
  liveLocations: "mot:liveLocations",
  emergencyAlerts: "mot:emergencyAlerts",
  clientLoyalty: "mot:clientLoyalty",
  trainerLoyalty: "mot:trainerLoyalty",
  refundLogs: "mot:refundLogs",
  penaltyLogs: "mot:penaltyLogs",
  notifications: "mot:notifications",
  trainerStrikes: "mot:trainerStrikes",
  clientAccounts: "mot:clientAccounts",
  proAccounts: "mot:proAccounts",
  crefDocuments: "mot:crefDocuments",
  recurringBookings: "mot:recurringBookings",
  recurringRequests: "mot:recurringRequests",
  adminBlocks: "mot:adminBlocks",
  wallet: "mot:wallet",
  walletTx: "mot:walletTx",
  pixKeys: "mot:pixKeys",
  crefValidation: "mot:crefValidation",
  customModalities: "mot:customModalities",
  supportTickets: "mot:supportTickets",
  clientSupportTickets: "mot:clientSupportTickets",
  blockedTrainers: "mot:blockedTrainers",
  privacySettings: "mot:privacySettings",
  proPrivacySettings: "mot:proPrivacySettings",
  termsAcceptance: "mot:termsAcceptance",
  privacyAcceptance: "mot:privacyAcceptance",
  blockedAccounts: "mot:blockedAccounts",
  referralCodes: "mot:referralCodes",
  referralRewards: "mot:referralRewards",
  rechargeCards: "mot:rechargeCards",
  redeemedCards: "mot:redeemedCards",
  faceProfile: "mot:faceProfile",
  faceLogs: "mot:faceLogs",
  trainerEquipment: "mot:trainerEquipment",
  admins: "mot:admins",
  userActivity: "mot:userActivity",
  adminCoupons: "mot:adminCoupons",
  adminReengagement: "mot:adminReengagement",
  trainerUnavailable: "mot:trainerUnavailable",
} as const;

// ---------- Admin generated coupons / reengagement ----------
export type AdminCoupon = {
  id: string;
  code: string;
  type: "percent_off" | "amount_off" | "free_boost" | "reduced_fee";
  value: number;
  label: string;
  targetUserId: string;
  targetEmail: string;
  createdAt: number;
};
export const ADMIN_COUPON_TEMPLATES: { type: AdminCoupon["type"]; value: number; label: string }[] = [
  { type: "percent_off", value: 20, label: "20% OFF" },
  { type: "amount_off", value: 20, label: "R$20 OFF" },
  { type: "free_boost", value: 1, label: "Boost grátis (7d)" },
  { type: "reduced_fee", value: 10, label: "Taxa reduzida (10%)" },
];
export type ReengagementLog = {
  id: string;
  userId: string;
  email: string;
  channel: "push" | "email" | "alert";
  message: string;
  date: number;
};

// ---------- Trainer manual unavailable slots ----------
export type TrainerUnavailableSlot = { id: string; trainerId: string; date: string; time?: string; reason?: string };

// ---------- Availability parsing (trainer.availability strings) ----------
const WEEKDAY_MAP: Record<string, string> = {
  dom: "Dom", seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sáb",
};
const WEEKDAY_ORDER = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function normDay(raw: string): string | null {
  const k = raw.toLowerCase().replace(/[.\s]/g, "").slice(0, 3).replace("á", "a");
  return WEEKDAY_MAP[k] ?? null;
}

export function parseAvailability(strings: string[]): { days: string[]; from: number; to: number }[] {
  const out: { days: string[]; from: number; to: number }[] = [];
  for (const raw of strings) {
    const m = raw.match(/^([^0-9]+?)\s*(\d{1,2})h?:?(\d{0,2})\s*[–\-—]\s*(\d{1,2})h?:?(\d{0,2})/);
    if (!m) continue;
    const dayPart = m[1].trim();
    const from = parseInt(m[2], 10) * 60 + (m[3] ? parseInt(m[3], 10) : 0);
    const to = parseInt(m[4], 10) * 60 + (m[5] ? parseInt(m[5], 10) : 0);
    const days: string[] = [];
    if (/[–\-—]/.test(dayPart)) {
      const parts = dayPart.split(/[–\-—]/).map((s) => normDay(s.trim()));
      const a = parts[0], b = parts[1];
      if (a && b) {
        const ai = WEEKDAY_ORDER.indexOf(a), bi = WEEKDAY_ORDER.indexOf(b);
        if (ai >= 0 && bi >= 0) {
          for (let i = ai; ; i = (i + 1) % 7) {
            days.push(WEEKDAY_ORDER[i]);
            if (i === bi) break;
          }
        }
      }
    } else {
      dayPart.split(/[,\s]+/).forEach((p) => { const d = normDay(p); if (d) days.push(d); });
    }
    if (days.length) out.push({ days, from, to });
  }
  return out;
}

export function isWithinTrainerAvailability(availability: string[], weekdayShort: string, time: string): boolean {
  const day = normDay(weekdayShort);
  if (!day) return false;
  const parts = time.split(":").map((n) => parseInt(n, 10));
  const minutes = parts[0] * 60 + (parts[1] || 0);
  const windows = parseAvailability(availability);
  return windows.some((w) => w.days.includes(day) && minutes >= w.from && minutes < w.to);
}

// ---------- Referral / recharge ----------
export type ReferralCode = { userId: string; code: string; createdAt: number };
export type ReferralReward = {
  id: string;
  referrerId: string;
  friendId?: string;
  status: "pending" | "completed";
  credit: number;
  createdAt: number;
};
export type RechargeCard = {
  code: string;
  value: number;
  expiration: string;
  active: boolean;
};
export const DEFAULT_RECHARGE_CARDS: RechargeCard[] = [
  { code: "MOT-2026-ABCD", value: 20, expiration: "2026-12-31", active: true },
  { code: "MOT-2026-EFGH", value: 50, expiration: "2026-12-31", active: true },
  { code: "MOT-2026-IJKL", value: 100, expiration: "2026-12-31", active: true },
];
export function generateReferralCode(seed: string) {
  const base = seed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4) || "USER";
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MOT-${base}-${rand}`;
}

// ---------- Face validation ----------
export type FaceProfile = { userId: string; selfieDataUrl: string; createdAt: number };
export type FaceLog = { id: string; userId: string; success: boolean; date: number };

// ---------- Trainer equipment ----------
export const EQUIPMENT_PRESETS = [
  "Halteres", "Corda", "Elásticos", "Bola suíça", "Kettlebell", "Cones",
  "Colchonetes", "TRX", "Faixas elásticas", "Escada funcional", "Barra olímpica",
  "Step", "Medicine ball", "Cronômetro", "Equipamentos de corrida",
] as const;
export type TrainerEquipment = { trainerId: string; items: string[]; updatedAt: number };

// ---------- Admin management ----------
export type AdminPermission = "suporte" | "financeiro" | "moderacao" | "cref" | "analytics";
export const ADMIN_PERMISSIONS: { id: AdminPermission; label: string }[] = [
  { id: "suporte", label: "Suporte" },
  { id: "financeiro", label: "Financeiro" },
  { id: "moderacao", label: "Moderação" },
  { id: "cref", label: "Validação de CREF" },
  { id: "analytics", label: "Analytics" },
];
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: AdminPermission[];
  createdAt: number;
};

// ---------- User activity (inactive monitoring) ----------
export type UserActivity = {
  userId: string;
  name: string;
  email: string;
  accountType: "client" | "pro";
  lastLogin: number;
  totalBookings: number;
};
export const DEFAULT_USER_ACTIVITY: UserActivity[] = [
  { userId: "u-inact-1", name: "Lucas Pereira", email: "lucas@example.com", accountType: "client", lastLogin: Date.now() - 86400000 * 45, totalBookings: 3 },
  { userId: "u-inact-2", name: "Ana Beatriz", email: "ana@example.com", accountType: "client", lastLogin: Date.now() - 86400000 * 60, totalBookings: 1 },
  { userId: "u-inact-3", name: "Felipe Souza", email: "felipe.pt@example.com", accountType: "pro", lastLogin: Date.now() - 86400000 * 35, totalBookings: 12 },
];


export const LEGAL_VERSION = "2026.08";
export type AccountType = "client" | "pro";
export type LegalAcceptance = {
  accepted: boolean;
  accepted_at: number | null;
  version: string | null;
  account_type: AccountType;
  user_id: string;
};
export type LegalAcceptanceMap = Record<string, LegalAcceptance>;

export type ClientSupportTicketType = "Pagamento" | "Profissional" | "Agendamento" | "Reembolso" | "Comportamento inadequado" | "Segurança" | "Outro";
export type ClientSupportMessage = { id: string; from: "client" | "admin"; text: string; date: number };
export type ClientSupportTicket = {
  id: string;
  clientId: string;
  clientName: string;
  type: ClientSupportTicketType;
  description: string;
  bookingId?: string;
  imageDataUrl?: string;
  status: "open" | "closed";
  priority: "low" | "medium" | "high";
  messages: ClientSupportMessage[];
  createdAt: number;
};

export type PrivacySettings = {
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  marketingEmails: boolean;
};
export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  notificationsEnabled: true,
  locationEnabled: true,
  marketingEmails: false,
};

export type SupportTicketType = "Pagamento" | "Cliente" | "Agendamento" | "Reembolso" | "Comportamento inadequado" | "Outro";
export type SupportTicketStatus = "open" | "closed";
export type SupportTicketPriority = "low" | "medium" | "high";
export type SupportMessage = { id: string; from: "trainer" | "admin"; text: string; date: number };
export type SupportTicket = {
  id: string;
  trainerId: string;
  trainerName: string;
  type: SupportTicketType;
  description: string;
  bookingId?: string;
  imageDataUrl?: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  messages: SupportMessage[];
  createdAt: number;
};

export type CustomModalityRequest = {
  id: string;
  name: string;
  trainerId: string;
  trainerName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
};

export type PixKeyType = "cpf" | "email" | "telefone" | "aleatoria";
export type PixKey = { id: string; type: PixKeyType; value: string; favorite?: boolean };

export type WalletState = {
  available: number;
  pending: number;
  withdrawnThisMonth: number;
  nextPayoutDate: string;
};
export const DEFAULT_WALLET: WalletState = {
  available: 2840,
  pending: 1480,
  withdrawnThisMonth: 0,
  nextPayoutDate: "Sex, 28 mai",
};

export type WalletTxType = "withdraw" | "receive" | "fee" | "refund" | "boost";
export type WalletTx = {
  id: string;
  type: WalletTxType;
  value: number;
  date: number;
  status: "completed" | "pending" | "failed";
  description: string;
};
export const DEFAULT_WALLET_TX: WalletTx[] = [
  { id: "tx1", type: "receive", value: 90, date: Date.now() - 86400000, status: "completed", description: "Treino com Marina Castro" },
  { id: "tx2", type: "fee", value: 13.5, date: Date.now() - 86400000, status: "completed", description: "Taxa da plataforma (15%)" },
  { id: "tx3", type: "receive", value: 67.5, date: Date.now() - 86400000 * 3, status: "pending", description: "Treino com Pedro Lima" },
  { id: "tx4", type: "boost", value: 29.9, date: Date.now() - 86400000 * 7, status: "completed", description: "Plano Boost semanal" },
];

export type CrefValidation = { status: "approved" | "pending" | "rejected"; number: string };
export const DEFAULT_CREF_VALIDATION: CrefValidation = { status: "approved", number: "012345-G/SP" };

export type ClientAccount = {
  id: string;
  name: string;
  birth: string;
  gender: string;
  phone: string;
  email: string;
  doc: string;
  address: string;
  city: string;
  state: string;
  photo?: string;
  createdAt: number;
  blocked?: boolean;
};

export type ProAccount = {
  id: string;
  name: string;
  birth: string;
  gender: string;
  phone: string;
  email: string;
  doc: string;
  address: string;
  city: string;
  state: string;
  education: string;
  cref: string;
  sessionPrice: number;
  description: string;
  specialties: string[];
  photo?: string;
  media: string[];
  crefDocUrl?: string;
  crefDocName?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  blocked?: boolean;
};

export type RecurringBooking = {
  id: string;
  clientId: string;
  clientName: string;
  trainerId: string;
  trainerName: string;
  days: string[]; // ["Seg","Qua"]
  time: string;
  duration: number;
  place: string;
  value: number;
  startDate: string;
  active: boolean;
  createdAt: number;
};

export type RecurringRequest = {
  id: string;
  clientId: string;
  clientName: string;
  trainerId: string;
  trainerName: string;
  days: string[];
  time: string;
  duration: number;
  place: string;
  value: number;
  startDate: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: number;
};

export type SafetyReport = {
  id: string;
  bookingId: string;
  reporter: "client" | "trainer";
  targetId: string;
  reason: string;
  details?: string;
  date: number;
};
export type BlockedUser = { id: string; blockedBy: "client" | "trainer"; targetId: string; date: number };
export type LiveLocation = {
  bookingId: string;
  sharedBy: "client" | "trainer";
  shareWith: "peer" | "emergency";
  lat: number;
  lng: number;
  updatedAt: number;
};
export type EmergencyAlert = {
  id: string;
  bookingId: string;
  type: "call_support" | "send_alert" | "share_location";
  date: number;
};
export type ClientLoyalty = { completedCount: number; pendingDiscount: boolean };
export type TrainerLoyalty = { completedCount: number; pendingReducedFee: boolean };
export const DEFAULT_CLIENT_LOYALTY: ClientLoyalty = { completedCount: 0, pendingDiscount: false };
export const DEFAULT_TRAINER_LOYALTY: TrainerLoyalty = { completedCount: 0, pendingReducedFee: false };
export type RefundLog = { id: string; bookingId: string; amount: number; reason: string; date: number };
export type PenaltyLog = {
  id: string;
  bookingId: string;
  userType: "client" | "trainer";
  amount: number;
  reason: string;
  date: number;
};
export type AppNotification = {
  id: string;
  audience: "client" | "trainer";
  title: string;
  body: string;
  date: number;
  read: boolean;
};

export type BoostPlan = "daily" | "weekly" | "monthly";
export type ProBoost = {
  active: boolean;
  plan: BoostPlan | null;
  startDate: string | null;
  endDate: string | null;
};
export const DEFAULT_PRO_BOOST: ProBoost = {
  active: false,
  plan: null,
  startDate: null,
  endDate: null,
};

// ---------- Conflict / loyalty / notif helpers ----------

export function slotKey(date: string, time: string) {
  return `${date.trim().toLowerCase()}|${time.trim()}`;
}
export function hasClientConflict(sessions: Session[], date: string, time: string) {
  const sk = slotKey(date, time);
  return sessions.some((s) => s.status === "upcoming" && slotKey(s.date, s.time) === sk);
}
export function hasTrainerConflict(
  schedules: { date: string; time: string }[],
  sessions: Session[],
  trainerId: string,
  date: string,
  time: string,
) {
  const sk = slotKey(date, time);
  if (schedules.some((s) => slotKey(s.date, s.time) === sk)) return true;
  if (
    sessions.some(
      (s) => s.trainerId === trainerId && s.status === "upcoming" && slotKey(s.date, s.time) === sk,
    )
  )
    return true;
  return false;
}
export function pushNotification(n: Omit<AppNotification, "id" | "date" | "read">) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEYS.notifications);
    const list: AppNotification[] = raw ? JSON.parse(raw) : [];
    const next: AppNotification = {
      ...n,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: Date.now(),
      read: false,
    };
    localStorage.setItem(KEYS.notifications, JSON.stringify([next, ...list].slice(0, 100)));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { key: KEYS.notifications } }));
  } catch {
    /* ignore */
  }
}
export function isBlocked(blocked: BlockedUser[], targetId: string) {
  return blocked.some((b) => b.targetId === targetId);
}

// ---------- Professional (trainer) domain ----------

export type Student = { id: string; name: string; photo: string };

export const STUDENTS: Student[] = [
  { id: "u1", name: "Marina Castro", photo: "https://api.dicebear.com/7.x/personas/svg?seed=Marina&backgroundColor=ffc700" },
  { id: "u2", name: "Pedro Lima", photo: "https://api.dicebear.com/7.x/personas/svg?seed=Pedro&backgroundColor=ffd740" },
  { id: "u3", name: "Júlia Souza", photo: "https://api.dicebear.com/7.x/personas/svg?seed=JuliaS&backgroundColor=ffeb3b" },
  { id: "u4", name: "Carlos Mendes", photo: "https://api.dicebear.com/7.x/personas/svg?seed=Carlos&backgroundColor=ffc700" },
];

export type ProRequest = {
  id: string;
  studentId: string;
  when: string;
  duration: string;
  value: number;
  place: string;
  quantity?: number;
};

export type ProSchedule = ProRequest & { date: string; time: string };

export type ProHistoryItem = {
  id: string;
  studentId: string;
  date: string;
  duration: string;
  place: string;
  value: number;
};

export type StudentReview = {
  id: string;
  studentId: string;
  rating: number;
  text?: string;
  date: string;
};

export type Availability = { day: string; from: string; to: string };

export type ProProfile = {
  name: string;
  birth: string;
  cref: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  education: string;
  specialties: string[];
  availability: Availability[];
  sessionDuration: number;
  sessionPrice: number;
  media: string[];
};

export const DEFAULT_PRO_REQUESTS: ProRequest[] = [
  { id: "b1", studentId: "u1", when: "Hoje · 18:00", duration: "60 min", value: 90, place: "Parque Villa-Lobos" },
  { id: "b2", studentId: "u2", when: "Amanhã · 07:00", duration: "45 min", value: 67.5, place: "Av. Faria Lima" },
];

export const DEFAULT_PRO_SCHEDULES: ProSchedule[] = [
  { id: "s-pro-1", studentId: "u3", when: "Qua · 19:00", date: "Qua", time: "19:00", duration: "60 min", value: 90, place: "Estúdio MoveOn" },
];

export const DEFAULT_PRO_HISTORY: ProHistoryItem[] = [
  { id: "h1", studentId: "u1", date: "12 mai · 18:00", duration: "60 min", place: "Parque Villa-Lobos", value: 90 },
  { id: "h2", studentId: "u4", date: "10 mai · 07:00", duration: "45 min", place: "Av. Paulista", value: 67.5 },
  { id: "h3", studentId: "u2", date: "08 mai · 19:00", duration: "60 min", place: "Estúdio MoveOn", value: 90 },
];

export const DEFAULT_PRO_PROFILE: ProProfile = {
  name: "Ricardo Alves",
  birth: "1988-07-12",
  cref: "012345-G/SP",
  phone: "(11) 97777-6666",
  email: "ricardo@meutrain.com",
  address: "Rua Harmonia, 200 — Vila Madalena, São Paulo/SP",
  description: "Especialista em hipertrofia e condicionamento físico. 8 anos de experiência.",
  education: "Bacharel em Educação Física - USP",
  specialties: ["Musculação", "Funcional"],
  availability: [
    { day: "Seg", from: "06:00", to: "11:00" },
    { day: "Ter", from: "14:00", to: "20:00" },
    { day: "Qua", from: "06:00", to: "11:00" },
    { day: "Qui", from: "14:00", to: "20:00" },
    { day: "Sex", from: "06:00", to: "11:00" },
  ],
  sessionDuration: 60,
  sessionPrice: 90,
  media: [],
};

export const DEFAULT_PERSONAL: Personal = {
  name: "Marina Castro",
  birth: "1992-04-18",
  gender: "Feminino",
  phone: "(11) 98888-7777",
  email: "demo@meutrain.com",
  doc: "123.456.789-00",
  address: "Rua Harmonia, 200 — Vila Madalena",
  city: "São Paulo",
  state: "SP",
};

export const DEFAULT_SESSIONS: Session[] = [
  { id: "s1", trainerId: "t1", date: "Hoje", time: "18:00", duration: 60, place: "Parque Villa-Lobos", value: 90, status: "upcoming" },
  { id: "s2", trainerId: "t4", date: "Sáb", time: "06:30", duration: 45, place: "Av. Paulista", value: 60, status: "upcoming" },
  { id: "s3", trainerId: "t2", date: "12 mai", time: "09:00", duration: 60, place: "Estúdio Camila", value: 120, status: "completed" },
  { id: "s4", trainerId: "t1", date: "08 mai", time: "07:00", duration: 60, place: "Parque Villa-Lobos", value: 90, status: "completed" },
];

export const COUPONS: Record<string, number> = {
  PRIMEIRO10: 10,
  TREINO20: 20,
  MOT15: 15,
};
