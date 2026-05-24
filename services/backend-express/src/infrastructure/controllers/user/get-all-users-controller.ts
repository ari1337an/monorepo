import type { Request, Response } from "express";
import type { IController } from "@/infrastructure/controllers/protocols/index";
import type { IGetAllUsersUseCase } from "@/domain/user/use-cases/index";
import { sendOk } from "@/shared/api-response/index";

export class GetAllUsersController implements IController {
  constructor(private readonly getAllUsersUseCase: IGetAllUsersUseCase) {}

  async execute(_request: Request, response: Response): Promise<void> {
    const users = await this.getAllUsersUseCase.perform();
    sendOk(response, { users });
  }
}
