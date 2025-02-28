import type { RequestHandler } from "express";

export default function tyex() {
  const tyex: RequestHandler = (req, res, next) => {
    next();
  };
  return tyex;
}
