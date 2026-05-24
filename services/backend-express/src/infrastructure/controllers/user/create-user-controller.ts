import type { Request, Response } from "express";
import type { IController } from "@/infrastructure/controllers/protocols/index";
import type { ICreateUserUseCase } from "@/domain/user/use-cases/index";

export class CreateUserController implements IController {
  constructor(private readonly createUserUseCase: ICreateUserUseCase) {}

  async execute(request: Request, response: Response): Promise<void> {
    const result = await this.createUserUseCase.perform(request.body);

    if (result.isLeft()) {
      const error = result.value;
      if (error.name === "InvalidParamError") {
        response.status(400).json({ error: error.message });
        return;
      }
      if (error.name === "AlreadyExistsError") {
        response.status(409).json({ error: error.message });
        return;
      }
    }

    if (result.isRight()) {
      response.status(201).json({ user: result.value });
    }
  }
}
