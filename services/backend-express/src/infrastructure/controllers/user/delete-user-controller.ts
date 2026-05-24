import type { Request, Response } from "express";
import type { IController } from "@/infrastructure/controllers/protocols/index";
import type { IDeleteUserUseCase } from "@/domain/user/use-cases/index";
import { sendOk, sendFailed } from "@/shared/api-response/index";

export class DeleteUserController implements IController {
  constructor(private readonly deleteUserUseCase: IDeleteUserUseCase) {}

  async execute(request: Request, response: Response): Promise<void> {
    const result = await this.deleteUserUseCase.perform(request.params.id as string);

    if (result.isLeft()) {
      const error = result.value;
      sendFailed(response, error.code, error.message, 404);
      return;
    }

    sendOk(response, null, 204);
  }
}
