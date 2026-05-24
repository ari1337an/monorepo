import type { UserType, UserUpdateType } from "@/domain/user/dtos/index";

export interface IUserRepository {
  getAll(): Promise<UserType[]>;
  getById(id: string): Promise<UserType | undefined>;
  getByEmail(email: string): Promise<UserType | undefined>;
  create(user: UserType): Promise<void>;
  update(id: string, data: UserUpdateType): Promise<UserType | undefined>;
  delete(id: string): Promise<boolean>;
}
