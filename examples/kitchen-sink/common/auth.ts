import type { RequestHandler } from "express";

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (token !== "secret-token") {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = { isAdmin: true };
  next();
};
