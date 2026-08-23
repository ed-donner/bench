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
import type { MessageKey, TranslateFn } from "../../shared/i18n";

export interface BlockTypeDef {
  type: string;
  label: string;
  keywords: string[];
  icon: ReactNode;
}

const BLOCK_TYPE_META: {
  type: string;
  labelKey: MessageKey;
  keywords: string[];
  icon: ReactNode;
}[] = [
  {
    type: "paragraph",
    labelKey: "space.block.paragraph",
    keywords: ["text", "paragraph", "plain"],
    icon: <Type size={16} />,
  },
  {
    type: "heading1",
    labelKey: "space.block.heading1",
    keywords: ["h1", "heading", "title"],
    icon: <Heading1 size={16} />,
  },
  {
    type: "heading2",
    labelKey: "space.block.heading2",
    keywords: ["h2", "heading", "subtitle"],
    icon: <Heading2 size={16} />,
  },
  {
    type: "heading3",
    labelKey: "space.block.heading3",
    keywords: ["h3", "heading"],
    icon: <Heading3 size={16} />,
  },
  {
    type: "bulleted",
    labelKey: "space.block.bulleted",
    keywords: ["bullet", "list", "ul"],
    icon: <List size={16} />,
  },
  {
    type: "numbered",
    labelKey: "space.block.numbered",
    keywords: ["number", "list", "ol"],
    icon: <ListOrdered size={16} />,
  },
  {
    type: "todo",
    labelKey: "space.block.todo",
    keywords: ["todo", "task", "checkbox"],
    icon: <SquareCheck size={16} />,
  },
  {
    type: "quote",
    labelKey: "space.block.quote",
    keywords: ["quote", "blockquote"],
    icon: <Quote size={16} />,
  },
  {
    type: "divider",
    labelKey: "space.block.divider",
    keywords: ["divider", "hr", "rule", "separator"],
    icon: <Minus size={16} />,
  },
  {
    type: "code",
    labelKey: "space.block.code",
    keywords: ["code", "snippet", "monospace"],
    icon: <Code size={16} />,
  },
  {
    type: "callout",
    labelKey: "space.block.callout",
    keywords: ["callout", "info", "note"],
    icon: <Lightbulb size={16} />,
  },
];

function blockTypeDefs(t: TranslateFn): BlockTypeDef[] {
  return BLOCK_TYPE_META.map(({ type, labelKey, keywords, icon }) => ({
    type,
    label: t(labelKey),
    keywords,
    icon,
  }));
}

export function filterBlockTypes(
  query: string,
  t: TranslateFn,
): BlockTypeDef[] {
  const defs = blockTypeDefs(t);
  const q = query.trim().toLowerCase();
  if (!q) return defs;
  return defs.filter(
    (d) =>
      d.label.toLowerCase().includes(q) ||
      d.keywords.some((k) => k.startsWith(q)),
  );
}
