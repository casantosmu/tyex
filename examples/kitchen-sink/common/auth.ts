import type { RequestHandler } from "express";

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (token !== "secret-token") {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  req.user = { isAdmin: true };
  next();
};
