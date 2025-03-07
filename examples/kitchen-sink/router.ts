import express from "express";
import userRoutes from "./user/user.routes";

const router = express.Router();

router.use("/users", userRoutes);

export default router;
