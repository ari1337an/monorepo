import type { Request, Response } from "express";
import type { IController } from "@/infrastructure/controllers/protocols/index";
import type { IUpdateUserUseCase } from "@/domain/user/use-cases/index";
import { sendOk, sendFailed } from "@/shared/api-response/index";

export class UpdateUserController implements IController {
  constructor(private readonly updateUserUseCase: IUpdateUserUseCase) {}

  async execute(request: Request, response: Response): Promise<void> {
    const result = await this.updateUserUseCase.perform(request.params.id as string, request.body);

    if (result.isLeft()) {
      const error = result.value;
      const statusMap: Record<string, number> = {
        InvalidParamError: 400,
        NotFoundError: 404,
        AlreadyExistsError: 409,
      };
      sendFailed(response, error.code, error.message, statusMap[error.name] ?? 400);
      return;
    }

    sendOk(response, { user: result.value });
  }
}
