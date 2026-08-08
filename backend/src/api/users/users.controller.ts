import * as UserService from "@/api/users/users.service.js";
import { User, UserBodyReq, UserParams, UserUpdateReq } from "@/types/db.types.js";
import { databaseLogger } from "@/utils/logger.js";
import { successRes } from "@/utils/messages.js";
import { asyncFn, hashPassword } from "@/utils/serverFn.js";

export const getUsers = asyncFn(async (_, res, __) => {
  const users = await UserService.findAllUsers();

  if (!users) {
    databaseLogger.warn("No user found");
  }

  databaseLogger.info(`${users.length !== 0 ? "All users found" : "No user was found"}`, users);
  successRes(res, 200, users);
});

export const getUserById = asyncFn<UserParams>(async (req, res, next) => {
  const { id } = req.params;

  const user = await UserService.findUserById(id);

  if (!user) {
    databaseLogger.error(`User with ID ${id} not found`);
    return next({ status: 404 });
  }

  databaseLogger.info(`User ID ${id} found`, user);
  successRes(res, 200, user);
});

export const getMe = asyncFn(async (req, res, next) => {
  const id = req.user?.id;

  if (!id) {
    return next({ status: 404 });
  }

  const userMe = await UserService.findUserById(id);

  if (!userMe) {
    databaseLogger.error(`User with ID ${id} not found`);
    return next({ status: 404 });
  }

  databaseLogger.info(`Seeing informations for your user`, userMe);
  successRes(res, 200, userMe);
});

export const createUser = asyncFn<{}, {}, UserBodyReq>(async (req, res, next) => {
  const { email, password, username, role } = req.body;

  if (!email || !password) {
    databaseLogger.error("Required fields not filled");
    return next({ status: 400 });
  }

  const existingUser = await UserService.findUserByEmail(email);
  if (existingUser) {
    databaseLogger.error("User already exists");
    return next({ status: 409 });
  }

  const randomizeUserSuffix = Math.floor(Math.random() * (99999 - 10000));
  const hashedPassword = await hashPassword(password);

  const userReq: User = {
    id: crypto.randomUUID(),
    username: username ?? `geek_${randomizeUserSuffix}`,
    email,
    password: hashedPassword,
    role: role ?? "USER",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const newUser = await UserService.createUser(userReq);

  const { password: _, ...userWithoutPassword } = newUser;

  databaseLogger.info(`User ${newUser.id} created`, newUser);
  successRes(res, 201, userWithoutPassword);
});

export const updateUser = asyncFn<UserParams, {}, UserUpdateReq>(async (req, res, next) => {
  const { id } = req.params;
  const { password, ...otherFields } = req.body;

  if (!id) {
    databaseLogger.error("ID is required");
    return next({ status: 400 });
  }

  const existingUser = await UserService.findUserById(id);
  if (!existingUser) {
    databaseLogger.error("User not found");
    return next({ status: 404 });
  }

  const fieldsToUpdate: Partial<User> = {
    ...otherFields,
    updatedAt: new Date(),
  };

  const hasFields = Object.keys(otherFields).length > 0 || password;

  if (!hasFields) {
    databaseLogger.error("No fields to update");
    return next({ status: 400 });
  }

  if (password) {
    fieldsToUpdate.password = await hashPassword(password);
  }

  const newUser = await UserService.alterUser(id, fieldsToUpdate);
  if (!newUser) {
    databaseLogger.error("Couldn't update user");
    return next({ status: 500 });
  }

  const { password: _, ...userWithoutPassword } = newUser;

  databaseLogger.info(`User ${id} updated`, userWithoutPassword);
  successRes(res, 200, userWithoutPassword);
});

export const deleteUser = asyncFn<UserParams>(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    databaseLogger.error("ID is required");
    return next({ status: 400 });
  }

  const existingUser = await UserService.findUserById(id);
  if (!existingUser) {
    databaseLogger.error(`User ${id} not found`);
    return next({ status: 404 });
  }

  await UserService.deleteUserById(id);

  databaseLogger.info(`User ${id} deleted`);
  successRes(res, 200, null);
});

export const deleteAllUsers = asyncFn(async (_, res, __) => {
  await UserService.deleteAllUsers();

  databaseLogger.info("All users deleted");
  successRes(res, 200, null);
});
