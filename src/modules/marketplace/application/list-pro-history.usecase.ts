import type { ProSession } from "../domain/marketplace.types";
import type { MarketplaceRepository } from "./marketplace.ports";

export class ListProHistoryUseCase {
  private repo: MarketplaceRepository;

  constructor(repo: MarketplaceRepository) {
    this.repo = repo;
  }

  execute(userId: string): Promise<ProSession[]> {
    return this.repo.listProHistory(userId);
  }
}