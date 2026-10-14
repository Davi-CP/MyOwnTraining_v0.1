import type { CreateBookingInput } from "../domain/marketplace.types";
import type { MarketplaceRepository } from "./marketplace.ports";

export class CreateBookingUseCase {
  private repo: MarketplaceRepository;

  constructor(repo: MarketplaceRepository) {
    this.repo = repo;
  }

  execute(userId: string, input: CreateBookingInput): Promise<string> {
    return this.repo.createBooking(userId, input);
  }
}