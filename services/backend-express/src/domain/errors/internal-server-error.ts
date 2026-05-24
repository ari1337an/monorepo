export class InternalServerError extends Error {
  readonly code = "INTERNAL_SERVER_ERROR";

  constructor(message = "Internal server error") {
    super(message);
    this.name = "InternalServerError";
  }
}
