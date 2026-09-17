import type { Booking } from "../domain/marketplace.types";
import type { MarketplaceRepository } from "./marketplace.ports";

export class ListBookingsUseCase {
  private repo: MarketplaceRepository;

  constructor(repo: MarketplaceRepository) {
    this.repo = repo;
  }

  execute(userId: string): Promise<Booking[]> {
    return this.repo.listBookings(userId);
  }
}