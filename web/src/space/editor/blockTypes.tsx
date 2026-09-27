import type { ReactNode } from "react";
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  Lightbulb,
  List,
  ListOrdered,
  Minus,
  Quote,
  SquareCheck,
  Type,
} from "lucide-react";
import { t } from "../strings";

/** A block type's name is in the catalogs, under block.<type>; the keywords stay English, so
    "/h1" finds a heading in either language. */
export interface BlockTypeDef {
  type: BlockKind;
  keywords: string[];
  icon: ReactNode;
}

type BlockKind =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulleted"
  | "numbered"
  | "todo"
  | "quote"
  | "divider"
  | "code"
  | "callout";

export const blockLabel = (type: BlockKind) => t(`block.${type}`);

const BLOCK_TYPE_DEFS: BlockTypeDef[] = [
  {
    type: "paragraph",
    keywords: ["text", "paragraph", "plain"],
    icon: <Type size={16} />,
  },
  {
    type: "heading1",
    keywords: ["h1", "heading", "title"],
    icon: <Heading1 size={16} />,
  },
  {
    type: "heading2",
    keywords: ["h2", "heading", "subtitle"],
    icon: <Heading2 size={16} />,
  },
  {
    type: "heading3",
    keywords: ["h3", "heading"],
    icon: <Heading3 size={16} />,
  },
  {
    type: "bulleted",
    keywords: ["bullet", "list", "ul"],
    icon: <List size={16} />,
  },
  {
    type: "numbered",
    keywords: ["number", "list", "ol"],
    icon: <ListOrdered size={16} />,
  },
  {
    type: "todo",
    keywords: ["todo", "task", "checkbox"],
    icon: <SquareCheck size={16} />,
  },
  {
    type: "quote",
    keywords: ["quote", "blockquote"],
    icon: <Quote size={16} />,
  },
  {
    type: "divider",
    keywords: ["divider", "hr", "rule", "separator"],
    icon: <Minus size={16} />,
  },
  {
    type: "code",
    keywords: ["code", "snippet", "monospace"],
    icon: <Code size={16} />,
  },
  {
    type: "callout",
    keywords: ["callout", "info", "note"],
    icon: <Lightbulb size={16} />,
  },
];

export function filterBlockTypes(query: string): BlockTypeDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return BLOCK_TYPE_DEFS;
  return BLOCK_TYPE_DEFS.filter(
    (d) =>
      blockLabel(d.type).toLowerCase().includes(q) ||
      d.keywords.some((k) => k.startsWith(q)),
  );
}
