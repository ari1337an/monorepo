import type { Either } from "@/shared/either/index";
import type { InvalidParamError } from "@/domain/errors/index";
import type { UserType } from "@/domain/user/dtos/index";

export type UserBuildInput = {
  name: string;
  email: string;
};

export type UserBuildResponse = Either<InvalidParamError, UserType>;
