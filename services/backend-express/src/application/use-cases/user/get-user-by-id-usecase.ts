import { left, right, type Either } from "@/shared/either/index";
import { NotFoundError } from "@/domain/errors/index";
import type { IGetUserByIdUseCase } from "@/domain/user/use-cases/index";
import type { UserType } from "@/domain/user/dtos/index";
import type { IUserRepository } from "@/application/repositories/user/user-repository";

export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async perform(id: string): Promise<Either<NotFoundError, UserType>> {
    const user = await this.userRepository.getById(id);

    if (!user) {
      return left(new NotFoundError("User"));
    }

    return right(user);
  }
}
