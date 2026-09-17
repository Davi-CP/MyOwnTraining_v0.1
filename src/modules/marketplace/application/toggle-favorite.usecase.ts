import type { MarketplaceRepository } from "./marketplace.ports";

export class ToggleFavoriteUseCase {
  private repo: MarketplaceRepository;

  constructor(repo: MarketplaceRepository) {
    this.repo = repo;
  }

  execute(userId: string, trainerId: string): Promise<boolean> {
    return this.repo.toggleFavorite(userId, trainerId);
  }
}