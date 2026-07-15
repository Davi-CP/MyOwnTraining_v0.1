import type { AuthRepository } from "./auth.ports";

export class SignOutUseCase {
  private repo: AuthRepository;

  constructor(repo: AuthRepository) {
    this.repo = repo;
  }
  execute() {
    return this.repo.signOut();
  }
}