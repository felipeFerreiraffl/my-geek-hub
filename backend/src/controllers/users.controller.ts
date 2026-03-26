import * as UserService from "@/services/users.service.js";
import { User, UserBodyReq } from "@/types/db.types.js";
import { asyncFn } from "@/utils/serverFn.js";
import { databaseLogger } from "@/utils/logger.js";
import { successRes } from "@/utils/messages.js";

export const getUsers = asyncFn(async (req, res, next) => {
  const users = await UserService.findAllUsers();

  databaseLogger.info(
    `${users.length !== 0 ? "All users found" : "No user was found"}`,
    users.length !== 0 ? JSON.stringify(users, null, 2) : "",
  );
  successRes(res, 200, users);

  next();
});

export const createUser = asyncFn<{}, {}, UserBodyReq>(
  async (req, res, next) => {
    const { email, password } = req.body;

    const randomizeUserSuffix = Math.floor(Math.random() * (99999 - 10000));

    const userReq: User = {
      id: crypto.randomUUID(),
      username: `geek_${randomizeUserSuffix}`,
      email,
      password,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newUser = await UserService.createUser(userReq);

    databaseLogger.info(
      `User ${newUser.id} created`,
      JSON.stringify(newUser, null, 2),
    );
    successRes(res, 201, newUser);

    next();
  },
);
