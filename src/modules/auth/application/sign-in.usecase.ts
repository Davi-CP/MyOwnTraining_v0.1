import type { AuthRepository } from "./auth.ports";

export class SignInUseCase {
  private repo: AuthRepository;

  constructor(repo: AuthRepository) {
    this.repo = repo;
  }
  execute(input: { email: string; password: string }) {
    return this.repo.signInWithPassword(input);
  }
}