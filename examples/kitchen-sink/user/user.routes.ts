import express from "express";
import { authenticate } from "../common/auth";
import userController from "./user.controller";

const userRoutes = express.Router();

userRoutes.get("/", userController.getAll);
userRoutes.post("/", userController.post);
userRoutes.delete("/protected/:id", authenticate, userController.delete);

export default userRoutes;
