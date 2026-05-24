import type { Response } from "express";

type ApiStatus = "OK" | "FAILED";

type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> = {
  status: ApiStatus;
  data: T | null;
  error: ApiError | null;
};

export function sendOk<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({
    status: "OK",
    data,
    error: null,
  } satisfies ApiResponse<T>);
}

export function sendFailed(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: unknown,
): void {
  res.status(statusCode).json({
    status: "FAILED",
    data: null,
    error: { code, message, ...(details !== undefined && { details }) },
  } satisfies ApiResponse<never>);
}
