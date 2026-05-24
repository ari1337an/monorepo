import type { IGetAllUsersUseCase } from "@/domain/user/use-cases/index";
import type { UserType } from "@/domain/user/dtos/index";
import type { IUserRepository } from "@/application/repositories/user/user-repository";

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async perform(): Promise<UserType[]> {
    return this.userRepository.getAll();
  }
}
