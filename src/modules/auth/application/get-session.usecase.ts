import type { AuthRepository } from "./auth.ports";

export class GetSessionUseCase {
  private repo: AuthRepository;
  
  constructor(repo: AuthRepository) {
    this.repo = repo;
  }
  
  execute() {
    return this.repo.getSession();
  }
}