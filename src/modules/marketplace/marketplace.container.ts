import { GetAdminMetricsUseCase } from "./application/get-admin-metrics.usecase";
import { GetTrainerUseCase } from "./application/get-trainer.usecase";
import { ListBookingsUseCase } from "./application/list-bookings.usecase";
import { ListFavoritesUseCase } from "./application/list-favorites.usecase";
import { ListProDashboardUseCase } from "./application/list-pro-dashboard.usecase";
import { ListProHistoryUseCase } from "./application/list-pro-history.usecase";
import { ListTrainersUseCase } from "./application/list-trainers.usecase";
import { ToggleFavoriteUseCase } from "./application/toggle-favorite.usecase";
import { SupabaseMarketplaceRepository } from "./infrastructure/supabase-marketplace.repository";

const repo = new SupabaseMarketplaceRepository();

export const marketplaceContainer = {
  listTrainers: new ListTrainersUseCase(repo),
  getTrainer: new GetTrainerUseCase(repo),
  listFavorites: new ListFavoritesUseCase(repo),
  listBookings: new ListBookingsUseCase(repo),
  listProDashboard: new ListProDashboardUseCase(repo),
  listProHistory: new ListProHistoryUseCase(repo),
  getAdminMetrics: new GetAdminMetricsUseCase(repo),
  toggleFavorite: new ToggleFavoriteUseCase(repo),
};