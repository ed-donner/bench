import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useT } from "../../shared/useLocale";
import type { MessageKey } from "../../shared/i18n";
import type { Block } from "../api";
import ContentEditable from "./ContentEditable";

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

const PLACEHOLDER_KEYS: Record<string, MessageKey> = {
  paragraph: "space.block.placeholder.paragraph",
  heading1: "space.block.placeholder.heading1",
  heading2: "space.block.placeholder.heading2",
  heading3: "space.block.placeholder.heading3",
  bulleted: "space.block.placeholder.listItem",
  numbered: "space.block.placeholder.listItem",
  todo: "space.block.placeholder.todo",
  quote: "space.block.placeholder.quote",
  code: "space.block.placeholder.code",
  callout: "space.block.placeholder.callout",
};

export default function BlockRow({
  block,
  number,
  version,
  ...handlers
}: Props) {
  const t = useT();
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
  const placeholderKey =
    PLACEHOLDER_KEYS[block.type] ?? "space.block.placeholder.paragraph";
  const placeholder = t(placeholderKey);

  const editable = (extraClass = "") => (
    <ContentEditable
      blockId={block.id}
      version={version}
      initialText={text}
      className={`block-text ${CLASSES[block.type] ?? "b-paragraph"}${extraClass}`}
      placeholder={placeholder}
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
              aria-label={
                text
                  ? t("space.block.todoAria", { text })
                  : t("space.block.placeholder.todo")
              }
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
        aria-label={t("space.block.dragAria")}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={15} />
      </button>
      <div className="block-content">{inner()}</div>
    </div>
  );
}
