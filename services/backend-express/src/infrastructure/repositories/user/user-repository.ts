import { prisma } from "@workspace/database";
import type { IUserRepository } from "@/application/repositories/user/user-repository";
import type { UserType, UserUpdateType } from "@/domain/user/dtos/index";

export class PrismaUserRepository implements IUserRepository {
  async getAll(): Promise<UserType[]> {
    return prisma.user.findMany();
  }

  async getById(id: string): Promise<UserType | undefined> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ?? undefined;
  }

  async getByEmail(email: string): Promise<UserType | undefined> {
    const user = await prisma.user.findFirst({ where: { email } });
    return user ?? undefined;
  }

  async create(user: UserType): Promise<void> {
    await prisma.user.create({ data: user });
  }

  async update(id: string, data: UserUpdateType): Promise<UserType | undefined> {
    try {
      return await prisma.user.update({ where: { id }, data });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
        return undefined;
      }
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
        return false;
      }
      throw err;
    }
  }
}
