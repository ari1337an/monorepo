export class AlreadyExistsError extends Error {
  readonly code = "ALREADY_EXISTS";

  constructor(param: string) {
    super(`Already exists: ${param}`);
    this.name = "AlreadyExistsError";
  }
}
