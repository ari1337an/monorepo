import type { Request, Response } from "express";
import type { IController } from "@/infrastructure/controllers/protocols/index";
import type { IGetUserByIdUseCase } from "@/domain/user/use-cases/index";

export class GetUserByIdController implements IController {
  constructor(private readonly getUserByIdUseCase: IGetUserByIdUseCase) {}

  async execute(request: Request, response: Response): Promise<void> {
    const result = await this.getUserByIdUseCase.perform(request.params.id as string);

    if (result.isLeft()) {
      response.status(404).json({ error: result.value.message });
      return;
    }

    response.status(200).json({ user: result.value });
  }
}
