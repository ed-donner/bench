import express from "express";
import type Database from "better-sqlite3";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { benchRouter } from "./bench/routes.js";
import { markDirtyOnWrite } from "./bench/middleware.js";
import { crmRouter } from "./crm/routes.js";
import { rolodexRouter } from "./rolodex/routes/index.js";
import type { Repo } from "./rolodex/db/index.js";
import { spaceRouter } from "./space/routes/index.js";

const webDist = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../web/dist",
);

/** The apps with their own HTML entry point in web/dist, for deep-link fallback. */
const APPS = ["crm", "space", "rolodex", "groove"];

export interface Dbs {
  crm: Database.Database;
  space: Database.Database;
  rolodex: Repo;
}

/** Build the Express app around the open databases. */
export function createApp(dbs: Dbs): express.Express {
  const app = express();
  // Rolodex accepts whole address books and photos in one request, which is why this is not 2mb.
  app.use(express.json({ limit: "25mb" }));

  // Express sends an ETag with every JSON reply, and a browser that revalidates one gets 304 with
  // an empty body - which the client then tries to parse. On a machine talking to itself there is
  // nothing to save by caching a list that changes every time you touch it.
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  app.use("/api/bench", benchRouter(dbs));
  app.use("/api/crm", markDirtyOnWrite(dbs.crm), crmRouter(dbs.crm));
  app.use("/api/space", markDirtyOnWrite(dbs.space), spaceRouter(dbs.space));
  app.use(
    "/api/rolodex",
    markDirtyOnWrite(dbs.rolodex.db),
    rolodexRouter(dbs.rolodex),
  );

  if (existsSync(webDist)) {
    app.use(express.static(webDist));
    app.use((req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api")) {
        next();
        return;
      }
      const owner = APPS.find(
        (name) => req.path === `/${name}` || req.path.startsWith(`/${name}/`),
      );
      res.sendFile(path.join(webDist, owner ?? "", "index.html"));
    });
  }
  return app;
}
