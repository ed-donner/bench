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

/** Icons keyed by block type — labels live in i18n. */
export const BLOCK_ICONS: Record<string, ReactNode> = {
  paragraph: <Type size={16} />,
  heading1: <Heading1 size={16} />,
  heading2: <Heading2 size={16} />,
  heading3: <Heading3 size={16} />,
  bulleted: <List size={16} />,
  numbered: <ListOrdered size={16} />,
  todo: <SquareCheck size={16} />,
  quote: <Quote size={16} />,
  divider: <Minus size={16} />,
  code: <Code size={16} />,
  callout: <Lightbulb size={16} />,
};
