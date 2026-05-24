import type { Request, Response } from "express";
import type { IController } from "@/infrastructure/controllers/protocols/index";
import type { IUpdateUserUseCase } from "@/domain/user/use-cases/index";

export class UpdateUserController implements IController {
  constructor(private readonly updateUserUseCase: IUpdateUserUseCase) {}

  async execute(request: Request, response: Response): Promise<void> {
    const result = await this.updateUserUseCase.perform(request.params.id as string, request.body);

    if (result.isLeft()) {
      const error = result.value;
      if (error.name === "InvalidParamError") {
        response.status(400).json({ error: error.message });
        return;
      }
      if (error.name === "NotFoundError") {
        response.status(404).json({ error: error.message });
        return;
      }
      if (error.name === "AlreadyExistsError") {
        response.status(409).json({ error: error.message });
        return;
      }
    }

    if (result.isRight()) {
      response.status(200).json({ user: result.value });
    }
  }
}
