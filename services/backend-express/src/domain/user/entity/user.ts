import { randomUUID } from "node:crypto";
import { left, right } from "@/shared/either/index";
import { InvalidParamError } from "@/domain/errors/index";
import { userCreateValidator } from "@/shared/validators/index";
import type { UserBuildInput, UserBuildResponse } from "./ports/index";

export class User {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
  ) {}

  static build(input: UserBuildInput): UserBuildResponse {
    const result = userCreateValidator.safeParse(input);

    if (!result.success) {
      const message = result.error.issues.map((i: { message: string }) => i.message).join(", ");
      return left(new InvalidParamError(message));
    }

    const user = new User(randomUUID(), result.data.name, result.data.email);

    return right({ id: user.id, name: user.name, email: user.email });
  }
}
