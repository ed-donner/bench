import { useEffect, useRef, useState } from "react";
import { ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import { useLocale } from "../../shared/useLocale";
import { api, type TreeNode } from "../api";
import ConfirmDialog from "./ConfirmDialog";
import Menu from "./Menu";

interface Props {
  node: TreeNode;
  depth: number;
  activeId?: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onNavigate: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  onDelete: (node: TreeNode) => void;
  onRenamed: () => Promise<void> | void;
}

export default function TreeItem(props: Props) {
  const {
    node,
    depth,
    activeId,
    expanded,
    onToggle,
    onNavigate,
    onCreateChild,
    onDelete,
    onRenamed,
  } = props;
  const { t } = useLocale();
  const isOpen = expanded.has(node.id);
  const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(node.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  const commitRename = async () => {
    setRenaming(false);
    if (draft !== node.title) {
      await api.updatePage(node.id, { title: draft });
      await onRenamed();
    }
  };

  const label = node.title || t("common.untitled");
  return (
    <div role="none">
      <div
        role="treeitem"
        aria-selected={node.id === activeId}
        aria-expanded={node.children.length > 0 ? isOpen : undefined}
        className={`tree-row${node.id === activeId ? " active" : ""}`}
        style={{ paddingLeft: 8 + depth * 16 }}
        tabIndex={0}
        onClick={() => onNavigate(node.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onNavigate(node.id);
          }
        }}
      >
        <button
          className={`chevron${isOpen ? " open" : ""}${node.children.length === 0 ? " hidden" : ""}`}
          aria-label={
            isOpen ? t("tree.collapse", { label }) : t("tree.expand", { label })
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          <ChevronRight size={14} />
        </button>
        <span className="tree-icon">
          {node.icon ?? (node.type === "database" ? "🗃️" : "📄")}
        </span>
        {renaming ? (
          <input
            ref={inputRef}
            className="tree-rename"
            value={draft}
            aria-label={t("tree.renamePage")}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={() => void commitRename()}
            onKeyDown={(e) => {
              if (e.key === "Enter") void commitRename();
              if (e.key === "Escape") {
                setDraft(node.title);
                setRenaming(false);
              }
            }}
          />
        ) : (
          <span className="tree-label">{label}</span>
        )}
        <span className="tree-actions">
          <button
            className="icon-btn"
            aria-label={t("tree.pageOptions", { label })}
            onClick={(e) => {
              e.stopPropagation();
              setMenuAt({ x: e.clientX, y: e.clientY });
            }}
          >
            <MoreHorizontal size={15} />
          </button>
          <button
            className="icon-btn"
            aria-label={t("tree.addPageInside", { label })}
            onClick={(e) => {
              e.stopPropagation();
              onCreateChild(node.id);
            }}
          >
            <Plus size={15} />
          </button>
        </span>
      </div>
      {menuAt && (
        <Menu
          at={menuAt}
          onClose={() => setMenuAt(null)}
          items={[
            {
              label: t("common.rename"),
              onSelect: () => {
                setDraft(node.title);
                setRenaming(true);
              },
            },
            {
              label: t("common.delete"),
              danger: true,
              onSelect: () => setConfirming(true),
            },
          ]}
        />
      )}
      {confirming && (
        <ConfirmDialog
          title={t("tree.deleteTitle", { label })}
          message={
            node.children.length > 0
              ? t("tree.deleteMessageNested", { label })
              : t("tree.deleteMessageSimple", { label })
          }
          confirmLabel={t("common.delete")}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDelete(node);
          }}
        />
      )}
      {isOpen &&
        node.children.map((child) => (
          <TreeItem key={child.id} {...props} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}
