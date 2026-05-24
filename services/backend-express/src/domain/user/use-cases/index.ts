import type { Either } from "@/shared/either/index";
import type { InvalidParamError, AlreadyExistsError, NotFoundError } from "@/domain/errors/index";
import type { UserType, UserCreateType, UserUpdateType } from "@/domain/user/dtos/index";

export interface ICreateUserUseCase {
  perform(input: UserCreateType): Promise<Either<InvalidParamError | AlreadyExistsError, UserType>>;
}

export interface IGetAllUsersUseCase {
  perform(): Promise<UserType[]>;
}

export interface IGetUserByIdUseCase {
  perform(id: string): Promise<Either<NotFoundError, UserType>>;
}

export interface IUpdateUserUseCase {
  perform(id: string, input: UserUpdateType): Promise<Either<InvalidParamError | NotFoundError | AlreadyExistsError, UserType>>;
}

export interface IDeleteUserUseCase {
  perform(id: string): Promise<Either<NotFoundError, void>>;
}
