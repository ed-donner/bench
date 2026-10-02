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

interface BlockTypeDef {
  type: string;
  labelKey: string;
  keywords: string[];
  icon: ReactNode;
}

const BLOCK_TYPE_DEFS: BlockTypeDef[] = [
  {
    type: "paragraph",
    labelKey: "blockType.text",
    keywords: ["text", "paragraph", "plain"],
    icon: <Type size={16} />,
  },
  {
    type: "heading1",
    labelKey: "blockType.heading1",
    keywords: ["h1", "heading", "title"],
    icon: <Heading1 size={16} />,
  },
  {
    type: "heading2",
    labelKey: "blockType.heading2",
    keywords: ["h2", "heading", "subtitle"],
    icon: <Heading2 size={16} />,
  },
  {
    type: "heading3",
    labelKey: "blockType.heading3",
    keywords: ["h3", "heading"],
    icon: <Heading3 size={16} />,
  },
  {
    type: "bulleted",
    labelKey: "blockType.bulleted",
    keywords: ["bullet", "list", "ul"],
    icon: <List size={16} />,
  },
  {
    type: "numbered",
    labelKey: "blockType.numbered",
    keywords: ["number", "list", "ol"],
    icon: <ListOrdered size={16} />,
  },
  {
    type: "todo",
    labelKey: "blockType.todo",
    keywords: ["todo", "task", "checkbox"],
    icon: <SquareCheck size={16} />,
  },
  {
    type: "quote",
    labelKey: "blockType.quote",
    keywords: ["quote", "blockquote"],
    icon: <Quote size={16} />,
  },
  {
    type: "divider",
    labelKey: "blockType.divider",
    keywords: ["divider", "hr", "rule", "separator"],
    icon: <Minus size={16} />,
  },
  {
    type: "code",
    labelKey: "blockType.code",
    keywords: ["code", "snippet", "monospace"],
    icon: <Code size={16} />,
  },
  {
    type: "callout",
    labelKey: "blockType.callout",
    keywords: ["callout", "info", "note"],
    icon: <Lightbulb size={16} />,
  },
];

export interface BlockTypeItem extends BlockTypeDef {
  label: string;
}

export function filterBlockTypes(
  query: string,
  t: (key: string) => string,
): BlockTypeItem[] {
  const items = BLOCK_TYPE_DEFS.map((d) => ({ ...d, label: t(d.labelKey) }));
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (d) =>
      d.label.toLowerCase().includes(q) ||
      d.keywords.some((k) => k.startsWith(q)),
  );
}
