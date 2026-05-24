import { left, right } from "@/shared/either/index";
import { AlreadyExistsError } from "@/domain/errors/index";
import { User } from "@/domain/user/entity/user";
import type { ICreateUserUseCase } from "@/domain/user/use-cases/index";
import type { UserCreateType, UserType } from "@/domain/user/dtos/index";
import type { Either } from "@/shared/either/index";
import type { InvalidParamError } from "@/domain/errors/index";
import type { IUserRepository } from "@/application/repositories/user/user-repository";

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async perform(input: UserCreateType): Promise<Either<InvalidParamError | AlreadyExistsError, UserType>> {
    const buildResult = User.build(input);

    if (buildResult.isLeft()) {
      return left(buildResult.value);
    }

    const existing = await this.userRepository.getByEmail(input.email);
    if (existing) {
      return left(new AlreadyExistsError(input.email));
    }

    const user = buildResult.value;
    await this.userRepository.create(user);

    return right(user);
  }
}
