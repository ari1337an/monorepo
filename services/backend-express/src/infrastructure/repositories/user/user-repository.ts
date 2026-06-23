import type { Database } from "@workspace/database";
import type { IUserRepository } from "@/application/repositories/user/user-repository";
import type { UserType, UserUpdateType } from "@/domain/user/dtos/index";

export class SqlUserRepository implements IUserRepository {
  constructor(private readonly db: Database) {}

  async getAll(): Promise<UserType[]> {
    return this.db.table<UserType>("User").select("*");
  }

  async getById(id: string): Promise<UserType | undefined> {
    const user = await this.db.table<UserType>("User").where({ id }).first();
    return user ?? undefined;
  }

  async getByEmail(email: string): Promise<UserType | undefined> {
    const user = await this.db.table<UserType>("User").where({ email }).first();
    return user ?? undefined;
  }

  async create(user: UserType): Promise<void> {
    await this.db.table("User").insert(user);
  }

  async update(id: string, data: UserUpdateType): Promise<UserType | undefined> {
    const updated = await this.db.table<UserType>("User").where({ id }).update(data).returning("*");
    return updated[0] ?? undefined;
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.db.table("User").where({ id }).delete();
    return count > 0;
  }
}
