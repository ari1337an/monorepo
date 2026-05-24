export class InvalidParamError extends Error {
  readonly code = "INVALID_PARAM";

  constructor(param: string) {
    super(`Invalid param: ${param}`);
    this.name = "InvalidParamError";
  }
}
