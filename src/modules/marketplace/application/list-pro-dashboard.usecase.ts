import type { ProDashboard } from "../domain/marketplace.types";
import type { MarketplaceRepository } from "./marketplace.ports";

export class ListProDashboardUseCase {
  private repo: MarketplaceRepository;

  constructor(repo: MarketplaceRepository) {
    this.repo = repo;
  }

  execute(userId: string): Promise<ProDashboard | null> {
    return this.repo.listProDashboard(userId);
  }
}