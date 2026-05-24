export class AlreadyExistsError extends Error {
  constructor(param: string) {
    super(`Already exists: ${param}`);
    this.name = "AlreadyExistsError";
  }
}
