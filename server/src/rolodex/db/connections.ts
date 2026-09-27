/** How two people are connected, and how that reads from either end. */
import { nowISO } from "../dates.js";
import type {
  Connection,
  ConnectionKind,
  ConnectionRole,
  ConnectionView,
} from "../types.js";
import {
  connectionFromRow,
  deleteRow,
  readRow,
  type DB,
  type Row,
} from "./rows.js";

export interface ConnectionInput {
  kind: ConnectionKind;
  a_is_parent: boolean;
  label: string | null;
  inverse_label: string | null;
  note: string | null;
}

export interface ConnectionsRepo {
  listConnections(personId: number): ConnectionView[];
  createConnection(a: number, b: number, input: ConnectionInput): Connection;
  deleteConnection(id: number): boolean;
}

/** Which side of a parent/child link this person is on; any other kind reads the same both ways. */
function connectionRole(personId: number, c: Connection): ConnectionRole {
  if (c.kind !== "parent_child") return c.kind;
  return c.a_is_parent === (personId === c.person_a) ? "parent" : "child";
}

/** The same row reads differently from each end: A is B's parent, so B is A's child. */
function describeConnection(
  personId: number,
  c: Connection,
  otherName: string,
): string {
  switch (c.kind) {
    case "partner":
      return `Partner of ${otherName}`;
    case "sibling":
      return `Sibling of ${otherName}`;
    case "colleague":
      return c.note
        ? `Colleague of ${otherName} — ${c.note}`
        : `Colleague of ${otherName}`;
    case "parent_child": {
      const isParent = c.a_is_parent === (personId === c.person_a);
      return isParent ? `Parent of ${otherName}` : `Child of ${otherName}`;
    }
    case "other":
      return personId === c.person_a
        ? c.label || `Connected to ${otherName}`
        : c.inverse_label || `Connected to ${otherName}`;
  }
}

export function connectionsRepo(db: DB): ConnectionsRepo {
  return {
    listConnections: (personId) =>
      (
        db
          .prepare(
            `SELECT c.*, pa.name AS a_name, pb.name AS b_name FROM connections c
             JOIN people pa ON pa.id = c.person_a
             JOIN people pb ON pb.id = c.person_b
             WHERE c.person_a = ? OR c.person_b = ?`,
          )
          .all(personId, personId) as Row[]
      ).map((r) => {
        const c = connectionFromRow(r);
        const isA = c.person_a === personId;
        const otherName = (isA ? r.b_name : r.a_name) as string;
        return {
          id: c.id,
          other_id: isA ? c.person_b : c.person_a,
          other_name: otherName,
          kind: c.kind,
          description: describeConnection(personId, c, otherName),
          role: connectionRole(personId, c),
          label: isA ? c.label : c.inverse_label,
          note: c.note,
        };
      }),

    createConnection: (a, b, input) => {
      const info = db
        .prepare(
          `INSERT INTO connections (person_a, person_b, kind, a_is_parent, label, inverse_label, note, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          a,
          b,
          input.kind,
          input.a_is_parent ? 1 : 0,
          input.label,
          input.inverse_label,
          input.note,
          nowISO(),
        );
      return connectionFromRow(
        readRow(db, "connections", info.lastInsertRowid),
      );
    },

    deleteConnection: (id) => deleteRow(db, "connections", id),
  };
}
