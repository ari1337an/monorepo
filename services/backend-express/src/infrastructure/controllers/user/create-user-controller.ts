import type { Request, Response } from "express";
import type { IController } from "@/infrastructure/controllers/protocols/index";
import type { ICreateUserUseCase } from "@/domain/user/use-cases/index";
import { sendOk, sendFailed } from "@/shared/api-response/index";

export class CreateUserController implements IController {
  constructor(private readonly createUserUseCase: ICreateUserUseCase) {}

  async execute(request: Request, response: Response): Promise<void> {
    const result = await this.createUserUseCase.perform(request.body);

    if (result.isLeft()) {
      const error = result.value;
      const statusCode = error.name === "AlreadyExistsError" ? 409 : 400;
      sendFailed(response, error.code, error.message, statusCode);
      return;
    }

    sendOk(response, { user: result.value }, 201);
  }
}
