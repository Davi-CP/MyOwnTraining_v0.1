import type { Trainer } from "../domain/marketplace.types";
import type { MarketplaceRepository } from "./marketplace.ports";

export class ListFavoritesUseCase {
  private repo: MarketplaceRepository;

  constructor(repo: MarketplaceRepository) {
    this.repo = repo;
  }

  execute(userId: string): Promise<Trainer[]> {
    return this.repo.listFavorites(userId);
  }
}