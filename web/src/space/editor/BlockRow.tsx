import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Block } from "../api";
import ContentEditable from "./ContentEditable";
import { useTranslation } from "react-i18next";

interface BlockHandlers {
  onTextInput: (id: string, text: string, caret: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, id: string) => void;
  onBlur: (id: string) => void;
  onToggleTodo: (id: string, checked: boolean) => void;
}

interface Props extends BlockHandlers {
  block: Block;
  number: number;
  version: number;
}

const CLASSES: Record<string, string> = {
  paragraph: "b-paragraph",
  heading1: "b-h1",
  heading2: "b-h2",
  heading3: "b-h3",
  bulleted: "b-list-text",
  numbered: "b-list-text",
  todo: "b-todo-text",
  quote: "b-quote-text",
  code: "b-code-text",
  callout: "b-callout-text",
};

/** Keys under `block`; a type with no entry gets no placeholder, as before. */
const PLACEHOLDERS: Record<string, string> = {
  paragraph: "slashHint",
  heading1: "heading1",
  heading2: "heading2",
  heading3: "heading3",
  bulleted: "listItem",
  numbered: "listItem",
  todo: "todo",
  quote: "quote",
  code: "code",
  callout: "callout",
};

export default function BlockRow({
  block,
  number,
  version,
  ...handlers
}: Props) {
  const { t } = useTranslation("space");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const text = (block.content.text as string | undefined) ?? "";
  const checked = Boolean(block.content.checked);

  const editable = (extraClass = "") => (
    <ContentEditable
      blockId={block.id}
      version={version}
      initialText={text}
      className={`block-text ${CLASSES[block.type] ?? "b-paragraph"}${extraClass}`}
      placeholder={
        PLACEHOLDERS[block.type] && t(`block.${PLACEHOLDERS[block.type]}`)
      }
      onTextInput={handlers.onTextInput}
      onKeyDown={handlers.onKeyDown}
      onBlur={handlers.onBlur}
    />
  );

  const inner = () => {
    switch (block.type) {
      case "heading1":
      case "heading2":
      case "heading3":
      case "paragraph":
        return editable();
      case "bulleted":
        return (
          <div className="b-listrow">
            <span className="b-bullet" aria-hidden="true">
              •
            </span>
            {editable()}
          </div>
        );
      case "numbered":
        return (
          <div className="b-listrow">
            <span className="b-number" aria-hidden="true">
              {number}.
            </span>
            {editable()}
          </div>
        );
      case "todo":
        return (
          <div className="b-listrow">
            <input
              type="checkbox"
              className="b-checkbox"
              checked={checked}
              aria-label={text || "To-do"}
              onChange={(e) =>
                handlers.onToggleTodo(block.id, e.target.checked)
              }
            />
            {editable(checked ? " b-done" : "")}
          </div>
        );
      case "quote":
        return <div className="b-quote">{editable()}</div>;
      case "divider":
        return <hr className="b-divider" />;
      case "code":
        return <div className="b-code">{editable()}</div>;
      case "callout":
        return (
          <div className="b-callout">
            <span className="b-callout-emoji" aria-hidden="true">
              💡
            </span>
            {editable()}
          </div>
        );
      default:
        return editable();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`block-row bt-${block.type}${isDragging ? " dragging" : ""}`}
      data-block-id={block.id}
    >
      <button
        className="drag-handle"
        aria-label={t("block.dragBlock")}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={15} />
      </button>
      <div className="block-content">{inner()}</div>
    </div>
  );
}
