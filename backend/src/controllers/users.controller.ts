import * as UserService from "@/services/users.service.js";
import {
  User,
  UserBodyReq,
  UserParams,
  UserQueries,
} from "@/types/db.types.js";
import { databaseLogger } from "@/utils/logger.js";
import { successRes } from "@/utils/messages.js";
import { asyncFn } from "@/utils/serverFn.js";

export const getUsers = asyncFn(async (_, res, next) => {
  const users = await UserService.findAllUsers();

  databaseLogger.info(
    `${users.length !== 0 ? "All users found" : "No user was found"}`,
    users.length !== 0 ? JSON.stringify(users, null, 2) : "",
  );
  successRes(res, 200, users);
});

export const createUser = asyncFn<{}, {}, UserBodyReq>(
  async (req, res, next) => {
    const { email, password, username } = req.body;

    if (!email || !password) {
      databaseLogger.error("Required fields not filled");
      return next({ status: 400 });
    }

    const randomizeUserSuffix = Math.floor(Math.random() * (99999 - 10000));

    const userReq: User = {
      id: crypto.randomUUID(),
      username: username ?? `geek_${randomizeUserSuffix}`,
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
  },
);

export const deleteUser = asyncFn<UserParams>(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    databaseLogger.error("ID is required");
    return next({ status: 400 });
  }

  await UserService.deleteUserById(id);

  databaseLogger.info(`User ${id} deleted`);
  successRes(res, 200, null);
});

export const deleteAllUsers = asyncFn<{}, {}, {}, UserQueries>(
  async (req, res, next) => {
    const { required_id } = req.query;

    // const requiredUser = await UserService.findUserById(required_id);

    if (!required_id) {
      databaseLogger.error("Cannot delete all users");
      return next({ status: 404 });
    }

    await UserService.deleteAllUsers();

    databaseLogger.info("All users deleted");
    successRes(res, 200, null);
  },
);
