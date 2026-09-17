import type { Trainer } from "../domain/marketplace.types";
import type { MarketplaceRepository } from "./marketplace.ports";

export class ListTrainersUseCase {
  private repo: MarketplaceRepository;

  constructor(repo: MarketplaceRepository) {
    this.repo = repo;
  }

  execute(userId: string | null): Promise<Trainer[]> {
    return this.repo.listTrainers(userId);
  }
}