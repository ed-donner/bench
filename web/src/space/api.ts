import { apiHeaders } from "../shared/apiHeaders";

async function req<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: apiHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(detail.error ?? `${method} ${url} failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export type PageType = "page" | "database" | "row";

export interface TreeNode {
  id: string;
  parent_id: string | null;
  type: PageType;
  title: string;
  icon: string | null;
  position: number;
  children: TreeNode[];
}

export interface Block {
  id: string;
  page_id: string;
  type: string;
  content: Record<string, unknown>;
  position: number;
}

export interface PageData {
  id: string;
  parent_id: string | null;
  type: PageType;
  title: string;
  icon: string | null;
  blocks: Block[];
}

export type PropertyType =
  "text" | "number" | "select" | "multi_select" | "date" | "checkbox" | "url";
export type ViewKind = "table" | "board" | "list";

export interface PropertyOption {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  position: number;
  options: PropertyOption[];
}

export interface DbRow {
  id: string;
  title: string;
  icon: string | null;
  position: number;
  values: Record<string, unknown>;
}

export interface Filter {
  propertyId: string;
  operator: string;
  value?: unknown;
}

export interface ViewConfig {
  filters: Filter[];
  sort: { propertyId: string; direction: "asc" | "desc" } | null;
  groupBy: string | null;
}

export interface DatabaseData {
  id: string;
  title: string;
  icon: string | null;
  properties: Property[];
  rows: DbRow[];
  views: Record<ViewKind, ViewConfig>;
}

export interface RowData {
  id: string;
  database_id: string;
  database_title: string;
  title: string;
  properties: Property[];
  values: Record<string, unknown>;
}

export const api = {
  tree: () => req<TreeNode[]>("GET", "/api/space/tree"),
  createBlock: (
    pageId: string,
    data: {
      id?: string;
      type: string;
      content: Record<string, unknown>;
      index?: number;
    },
  ) => req<Block>("POST", `/api/space/pages/${pageId}/blocks`, data),
  updateBlock: (
    id: string,
    data: { type?: string; content?: Record<string, unknown> },
  ) => req<Block>("PATCH", `/api/space/blocks/${id}`, data),
  deleteBlock: (id: string) =>
    req<{ ok: boolean }>("DELETE", `/api/space/blocks/${id}`),
  reorderBlocks: (pageId: string, ids: string[]) =>
    req<{ ok: boolean }>("PUT", `/api/space/pages/${pageId}/blocks/order`, {
      ids,
    }),
  createPage: (data: {
    parentId?: string | null;
    title?: string;
    icon?: string | null;
    type?: PageType;
  }) => req<PageData>("POST", "/api/space/pages", data),
  getPage: (id: string) => req<PageData>("GET", `/api/space/pages/${id}`),
  updatePage: (id: string, data: { title?: string; icon?: string | null }) =>
    req<PageData>("PATCH", `/api/space/pages/${id}`, data),
  deletePage: (id: string) =>
    req<{ ok: boolean }>("DELETE", `/api/space/pages/${id}`),
  getDatabase: (id: string) =>
    req<DatabaseData>("GET", `/api/space/databases/${id}`),
  addProperty: (dbId: string, data: { name: string; type: PropertyType }) =>
    req<Property>("POST", `/api/space/databases/${dbId}/properties`, data),
  renameProperty: (id: string, name: string) =>
    req<Property>("PATCH", `/api/space/properties/${id}`, { name }),
  deleteProperty: (id: string) =>
    req<{ ok: boolean }>("DELETE", `/api/space/properties/${id}`),
  addOption: (propertyId: string, data: { name: string; color: string }) =>
    req<PropertyOption>(
      "POST",
      `/api/space/properties/${propertyId}/options`,
      data,
    ),
  reorderOptions: (propertyId: string, ids: string[]) =>
    req<{ ok: boolean }>(
      "PUT",
      `/api/space/properties/${propertyId}/options/order`,
      { ids },
    ),
  addRow: (
    dbId: string,
    data: { title?: string; values?: Record<string, unknown> } = {},
  ) => req<DbRow>("POST", `/api/space/databases/${dbId}/rows`, data),
  reorderRows: (dbId: string, ids: string[]) =>
    req<{ ok: boolean }>("PUT", `/api/space/databases/${dbId}/rows/order`, {
      ids,
    }),
  setRowValue: (rowId: string, propertyId: string, value: unknown) =>
    req<{ ok: boolean }>("PATCH", `/api/space/rows/${rowId}/values`, {
      propertyId,
      value,
    }),
  getRow: (id: string) => req<RowData>("GET", `/api/space/rows/${id}`),
  updateView: (dbId: string, kind: ViewKind, config: Partial<ViewConfig>) =>
    req<ViewConfig>(
      "PATCH",
      `/api/space/databases/${dbId}/views/${kind}`,
      config,
    ),
  search: (q: string) =>
    req<SearchResult[]>("GET", `/api/space/search?q=${encodeURIComponent(q)}`),
};

export interface SearchResult {
  id: string;
  title: string;
  icon: string | null;
  type: PageType;
  parent_title: string | null;
  parent_type: PageType | null;
}
