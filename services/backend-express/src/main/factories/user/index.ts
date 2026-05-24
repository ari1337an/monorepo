import { PrismaUserRepository } from "@/infrastructure/repositories/user/user-repository";
import { CreateUserUseCase } from "@/application/use-cases/user/create-user-usecase";
import { GetAllUsersUseCase } from "@/application/use-cases/user/get-all-users-usecase";
import { GetUserByIdUseCase } from "@/application/use-cases/user/get-user-by-id-usecase";
import { UpdateUserUseCase } from "@/application/use-cases/user/update-user-usecase";
import { DeleteUserUseCase } from "@/application/use-cases/user/delete-user-usecase";
import { CreateUserController } from "@/infrastructure/controllers/user/create-user-controller";
import { GetAllUsersController } from "@/infrastructure/controllers/user/get-all-users-controller";
import { GetUserByIdController } from "@/infrastructure/controllers/user/get-user-by-id-controller";
import { UpdateUserController } from "@/infrastructure/controllers/user/update-user-controller";
import { DeleteUserController } from "@/infrastructure/controllers/user/delete-user-controller";
import type { IController } from "@/infrastructure/controllers/protocols/index";

const userRepository = new PrismaUserRepository();

export function makeCreateUserFactory(): IController {
  return new CreateUserController(new CreateUserUseCase(userRepository));
}

export function makeGetAllUsersFactory(): IController {
  return new GetAllUsersController(new GetAllUsersUseCase(userRepository));
}

export function makeGetUserByIdFactory(): IController {
  return new GetUserByIdController(new GetUserByIdUseCase(userRepository));
}

export function makeUpdateUserFactory(): IController {
  return new UpdateUserController(new UpdateUserUseCase(userRepository));
}

export function makeDeleteUserFactory(): IController {
  return new DeleteUserController(new DeleteUserUseCase(userRepository));
}
