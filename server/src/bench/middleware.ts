import type { RequestHandler } from "express";
import type Database from "better-sqlite3";
import { markPristine } from "./meta.js";

/** Flip seed_pristine off when the user mutates data through the API. */
export function markDirtyOnWrite(db: Database.Database): RequestHandler {
  return (req, _res, next) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      markPristine(db, false);
    }
    next();
  };
}
