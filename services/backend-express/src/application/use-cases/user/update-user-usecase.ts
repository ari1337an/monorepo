import { left, right, type Either } from "@/shared/either/index";
import { InvalidParamError, NotFoundError, AlreadyExistsError } from "@/domain/errors/index";
import { userUpdateValidator } from "@/shared/validators/index";
import type { IUpdateUserUseCase } from "@/domain/user/use-cases/index";
import type { UserType, UserUpdateType } from "@/domain/user/dtos/index";
import type { IUserRepository } from "@/application/repositories/user/user-repository";

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async perform(id: string, input: UserUpdateType): Promise<Either<InvalidParamError | NotFoundError | AlreadyExistsError, UserType>> {
    const validation = userUpdateValidator.safeParse(input);

    if (!validation.success) {
      const message = validation.error.issues.map((i: { message: string }) => i.message).join(", ");
      return left(new InvalidParamError(message));
    }

    if (input.email) {
      const existing = await this.userRepository.getByEmail(input.email);
      if (existing && existing.id !== id) {
        return left(new AlreadyExistsError(input.email));
      }
    }

    const updated = await this.userRepository.update(id, validation.data);

    if (!updated) {
      return left(new NotFoundError("User"));
    }

    return right(updated);
  }
}
