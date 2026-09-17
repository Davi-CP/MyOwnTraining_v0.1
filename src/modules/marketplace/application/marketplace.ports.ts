import type {
  AdminMetrics,
  Booking,
  ProDashboard,
  ProSession,
  Trainer,
} from "../domain/marketplace.types";

export interface MarketplaceRepository {
  listTrainers(userId: string | null): Promise<Trainer[]>;
  getTrainer(trainerId: string, userId: string | null): Promise<Trainer | null>;
  listFavorites(userId: string): Promise<Trainer[]>;
  listBookings(userId: string): Promise<Booking[]>;
  listProDashboard(userId: string): Promise<ProDashboard | null>;
  listProHistory(userId: string): Promise<ProSession[]>;
  getAdminMetrics(): Promise<AdminMetrics>;
  toggleFavorite(userId: string, trainerId: string): Promise<boolean>;
}