import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedLocaleFromEnv } from "./bench/locale.js";
import { openDb as openCrmDb } from "./crm/db.js";
import { isSeeded, seed } from "./crm/seed/index.js";
import { openDb as openRolodexDb } from "./rolodex/db/index.js";
import { seedIfEmpty as seedRolodex } from "./rolodex/seed/index.js";
import { openDb as openSpaceDb } from "./space/db.js";
import { seedIfEmpty } from "./space/seed/index.js";
import { createApp } from "./app.js";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const dataDir = path.resolve(root, process.env.DATA_DIR ?? "data");
const port = Number(process.env.PORT ?? 8100);
const seedLocale = seedLocaleFromEnv();

mkdirSync(dataDir, { recursive: true });

const crm = openCrmDb(path.join(dataDir, "crm.sqlite"));
if (!isSeeded(crm)) {
  seed(crm, seedLocale);
  console.log(`Seeded the CRM database with sample data (${seedLocale})`);
}

const space = openSpaceDb(path.join(dataDir, "personal-space.db"));
seedIfEmpty(space, seedLocale);

const rolodex = openRolodexDb(path.join(dataDir, "rolodex.sqlite"));
seedRolodex(rolodex, seedLocale);

createApp({ crm, space, rolodex }).listen(port, () => {
  console.log(`Bench running at http://localhost:${port}`);
});
