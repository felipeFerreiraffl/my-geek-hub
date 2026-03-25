import { db } from "@/config/db.js";
import { User } from "@/types/db.types.js";

export const getAllUsers = async (): Promise<User[]> => {
  return await db.query.users.findMany();
};
