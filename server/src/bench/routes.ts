import { Router } from "express";
import type { BenchDbs } from "./reseed.js";
import { wipeAndReseed } from "./reseed.js";
import { getSeedLocale, isPristine } from "./meta.js";
import { parseSeedLocale } from "./locale.js";

export function benchRouter(dbs: BenchDbs): Router {
  const router = Router();

  router.post("/locale", (req, res) => {
    const body = req.body as { locale?: unknown };
    const locale = parseSeedLocale(body.locale);
    if (!locale) {
      res.status(400).json({ error: "locale must be 'en' or 'es'" });
      return;
    }

    const current = getSeedLocale(dbs.crm);
    const allPristine =
      isPristine(dbs.crm) &&
      isPristine(dbs.space) &&
      isPristine(dbs.rolodex.db);

    if (!allPristine) {
      res.json({ reseeded: false, locale: current });
      return;
    }

    wipeAndReseed(dbs, locale);
    res.json({ reseeded: true, locale });
  });

  return router;
}
