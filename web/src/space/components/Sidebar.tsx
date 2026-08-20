import { useState } from "react";
import { useMatch, useNavigate } from "react-router";
import { Database, Plus, Search } from "lucide-react";
import { IconSpace } from "../../shared/AppIcons";
import { useT } from "../../shared/useLocale";
import { api, type TreeNode } from "../api";
import TreeItem from "./TreeItem";
import { subtreeContains } from "../tree";

interface Props {
  tree: TreeNode[];
  onChange: () => Promise<void> | void;
  onSearch: () => void;
}

function loadExpanded(): Set<string> {
  try {
    return new Set(
      JSON.parse(localStorage.getItem("ps.expanded") ?? "[]") as string[],
    );
  } catch {
    return new Set();
  }
}

export default function Sidebar({ tree, onChange, onSearch }: Props) {
  const t = useT();
  const navigate = useNavigate();
  const pageId = useMatch("/p/:pageId")?.params.pageId;
  const [expanded, setExpanded] = useState<Set<string>>(loadExpanded);

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
    localStorage.setItem("ps.expanded", JSON.stringify([...next]));
  };

  const createPage = async (
    parentId: string | null,
    type: "page" | "database" = "page",
  ) => {
    const page = await api.createPage({ parentId, title: "", type });
    if (parentId && !expanded.has(parentId)) toggle(parentId);
    // Open it first, then refresh the tree. The other way round leaves you looking at the old page
    // for as long as the tree takes to load, which grows with the workspace.
    void navigate(`/p/${page.id}`, { state: { isNew: true } });
    await onChange();
  };

  const deletePage = async (node: TreeNode) => {
    await api.deletePage(node.id);
    await onChange();
    if (pageId && subtreeContains(node, pageId)) void navigate("/");
  };

  return (
    <nav className="sidebar">
      <div className="brand">
        <IconSpace size={20} />
        <span className="brand-name">{t("space.brand")}</span>
      </div>
      <div className="sidebar-top">
        <button className="sidebar-action" onClick={onSearch}>
          <Search size={15} />
          {t("space.sidebar.search")}
          <kbd className="sidebar-kbd">{t("space.sidebar.searchShortcut")}</kbd>
        </button>
      </div>
      <div
        className="tree"
        role="tree"
        aria-label={t("space.sidebar.pagesAria")}
      >
        {tree.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            depth={0}
            activeId={pageId}
            expanded={expanded}
            onToggle={toggle}
            onNavigate={(id) => void navigate(`/p/${id}`)}
            onCreateChild={(parentId) => void createPage(parentId)}
            onDelete={(child) => void deletePage(child)}
            onRenamed={onChange}
          />
        ))}
      </div>
      <div className="sidebar-footer">
        <button
          className="sidebar-action"
          onClick={() => void createPage(null)}
        >
          <Plus size={16} />
          {t("space.sidebar.newPage")}
        </button>
        <button
          className="sidebar-action"
          onClick={() => void createPage(null, "database")}
        >
          <Database size={15} />
          {t("space.sidebar.newDatabase")}
        </button>
      </div>
    </nav>
  );
}
