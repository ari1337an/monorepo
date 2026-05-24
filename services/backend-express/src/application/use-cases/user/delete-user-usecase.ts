import { left, right, type Either } from "@/shared/either/index";
import { NotFoundError } from "@/domain/errors/index";
import type { IDeleteUserUseCase } from "@/domain/user/use-cases/index";
import type { IUserRepository } from "@/application/repositories/user/user-repository";

export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async perform(id: string): Promise<Either<NotFoundError, void>> {
    const deleted = await this.userRepository.delete(id);

    if (!deleted) {
      return left(new NotFoundError("User"));
    }

    return right(undefined);
  }
}
