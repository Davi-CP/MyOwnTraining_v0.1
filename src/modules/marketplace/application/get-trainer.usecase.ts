import type { Trainer } from "../domain/marketplace.types";
import type { MarketplaceRepository } from "./marketplace.ports";

export class GetTrainerUseCase {
  private repo: MarketplaceRepository;

  constructor(repo: MarketplaceRepository) {
    this.repo = repo;
  }

  execute(trainerId: string, userId: string | null): Promise<Trainer | null> {
    return this.repo.getTrainer(trainerId, userId);
  }
}