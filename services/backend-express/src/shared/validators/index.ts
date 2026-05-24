import { z } from "zod";

export const emailValidator = z.string().email("Invalid email format");

export const nameValidator = z.string().min(2, "Name must be at least 2 characters").max(30, "Name must be at most 30 characters");

export const userCreateValidator = z.object({
  name: nameValidator,
  email: emailValidator,
});

export const userUpdateValidator = z.object({
  name: nameValidator.optional(),
  email: emailValidator.optional(),
}).refine((data) => data.name || data.email, {
  message: "At least one field (name or email) must be provided",
});
