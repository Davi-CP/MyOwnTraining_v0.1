import type { AdminMetrics } from "../domain/marketplace.types";
import type { MarketplaceRepository } from "./marketplace.ports";

export class GetAdminMetricsUseCase {
  private repo: MarketplaceRepository;

  constructor(repo: MarketplaceRepository) {
    this.repo = repo;
  }

  execute(): Promise<AdminMetrics> {
    return this.repo.getAdminMetrics();
  }
}