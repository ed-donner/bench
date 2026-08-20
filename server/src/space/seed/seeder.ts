import type Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

interface BlockSpec {
  type: string;
  [key: string]: unknown;
}

export class Seeder {
  private positions = new Map<string | null, number>();

  constructor(private db: Database.Database) {}

  page(opts: {
    parent?: string | null;
    title: string;
    icon?: string;
    type?: string;
  }): string {
    const parent = opts.parent ?? null;
    const pos = this.positions.get(parent) ?? 0;
    this.positions.set(parent, pos + 1);
    const id = randomUUID();
    this.db
      .prepare(
        "INSERT INTO pages (id, parent_id, type, title, icon, position) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(id, parent, opts.type ?? "page", opts.title, opts.icon ?? null, pos);
    return id;
  }

  blocks(pageId: string, specs: BlockSpec[]): void {
    const insert = this.db.prepare(
      "INSERT INTO blocks (id, page_id, type, content, position) VALUES (?, ?, ?, ?, ?)",
    );
    specs.forEach(({ type, ...content }, i) => {
      insert.run(randomUUID(), pageId, type, JSON.stringify(content), i);
    });
  }

  property(databaseId: string, name: string, type: string): string {
    const { pos } = this.db
      .prepare(
        "SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM properties WHERE database_id = ?",
      )
      .get(databaseId) as { pos: number };
    const id = randomUUID();
    this.db
      .prepare(
        "INSERT INTO properties (id, database_id, name, type, position) VALUES (?, ?, ?, ?, ?)",
      )
      .run(id, databaseId, name, type, pos);
    return id;
  }

  options(
    propertyId: string,
    defs: [string, string][],
  ): Record<string, string> {
    const ids: Record<string, string> = {};
    defs.forEach(([name, color], i) => {
      const id = randomUUID();
      this.db
        .prepare(
          "INSERT INTO property_options (id, property_id, name, color, position) VALUES (?, ?, ?, ?, ?)",
        )
        .run(id, propertyId, name, color, i);
      ids[name] = id;
    });
    return ids;
  }

  row(
    databaseId: string,
    title: string,
    values: Record<string, unknown>,
  ): string {
    const { pos } = this.db
      .prepare(
        "SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM pages WHERE parent_id = ?",
      )
      .get(databaseId) as { pos: number };
    const id = randomUUID();
    this.db
      .prepare(
        "INSERT INTO pages (id, parent_id, type, title, position) VALUES (?, ?, 'row', ?, ?)",
      )
      .run(id, databaseId, title, pos);
    const insert = this.db.prepare(
      "INSERT INTO row_values (row_id, property_id, value) VALUES (?, ?, ?)",
    );
    for (const [propId, value] of Object.entries(values)) {
      if (value !== undefined) insert.run(id, propId, JSON.stringify(value));
    }
    return id;
  }

  view(
    databaseId: string,
    kind: string,
    config: Record<string, unknown>,
  ): void {
    this.db
      .prepare(
        "INSERT INTO views (database_id, kind, config) VALUES (?, ?, ?) ON CONFLICT(database_id, kind) DO UPDATE SET config = excluded.config",
      )
      .run(databaseId, kind, JSON.stringify(config));
  }
}
