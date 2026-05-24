import type { Request, Response } from "express";
import type { IController } from "@/infrastructure/controllers/protocols/index";
import type { IDeleteUserUseCase } from "@/domain/user/use-cases/index";

export class DeleteUserController implements IController {
  constructor(private readonly deleteUserUseCase: IDeleteUserUseCase) {}

  async execute(request: Request, response: Response): Promise<void> {
    const result = await this.deleteUserUseCase.perform(request.params.id as string);

    if (result.isLeft()) {
      response.status(404).json({ error: result.value.message });
      return;
    }

    response.status(204).send();
  }
}
