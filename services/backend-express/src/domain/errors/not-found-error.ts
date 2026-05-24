export class NotFoundError extends Error {
  constructor(param: string) {
    super(`Not found: ${param}`);
    this.name = "NotFoundError";
  }
}
