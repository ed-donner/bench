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
import { translate } from "../../shared/i18n";

export interface BlockTypeDef {
  type: string;
  /** Also the key under `block`: the menu translates it where it draws the row. */
  label: string;
  keywords: string[];
  icon: ReactNode;
}

const BLOCK_TYPE_DEFS: BlockTypeDef[] = [
  {
    type: "paragraph",
    label: "text",
    keywords: ["text", "paragraph", "plain"],
    icon: <Type size={16} />,
  },
  {
    type: "heading1",
    label: "heading1",
    keywords: ["h1", "heading", "title"],
    icon: <Heading1 size={16} />,
  },
  {
    type: "heading2",
    label: "heading2",
    keywords: ["h2", "heading", "subtitle"],
    icon: <Heading2 size={16} />,
  },
  {
    type: "heading3",
    label: "heading3",
    keywords: ["h3", "heading"],
    icon: <Heading3 size={16} />,
  },
  {
    type: "bulleted",
    label: "bulleted",
    keywords: ["bullet", "list", "ul"],
    icon: <List size={16} />,
  },
  {
    type: "numbered",
    label: "numbered",
    keywords: ["number", "list", "ol"],
    icon: <ListOrdered size={16} />,
  },
  {
    type: "todo",
    label: "todo",
    keywords: ["todo", "task", "checkbox"],
    icon: <SquareCheck size={16} />,
  },
  {
    type: "quote",
    label: "quote",
    keywords: ["quote", "blockquote"],
    icon: <Quote size={16} />,
  },
  {
    type: "divider",
    label: "divider",
    keywords: ["divider", "hr", "rule", "separator"],
    icon: <Minus size={16} />,
  },
  {
    type: "code",
    label: "code",
    keywords: ["code", "snippet", "monospace"],
    icon: <Code size={16} />,
  },
  {
    type: "callout",
    label: "callout",
    keywords: ["callout", "info", "note"],
    icon: <Lightbulb size={16} />,
  },
];

export function filterBlockTypes(query: string): BlockTypeDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return BLOCK_TYPE_DEFS;
  return BLOCK_TYPE_DEFS.filter(
    (d) =>
      translate(`space:block.${d.label}`).toLowerCase().includes(q) ||
      d.keywords.some((k) => k.startsWith(q)),
  );
}
