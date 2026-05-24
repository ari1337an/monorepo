export class NotFoundError extends Error {
  readonly code = "NOT_FOUND";

  constructor(param: string) {
    super(`Not found: ${param}`);
    this.name = "NotFoundError";
  }
}
