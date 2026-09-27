import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import BenchNav from "../shared/BenchNav";
import { api, type TreeNode } from "./api";
import Sidebar from "./components/Sidebar";
import PageView from "./components/PageView";
import SearchModal from "./components/SearchModal";
import { useLang } from "../shared/i18n";
import { useT } from "./strings";

export default function App() {
  // Re-render the whole page on a language switch, including helpers that read the plain t().
  useLang();
  const t = useT();
  useEffect(() => {
    document.title = t("app.name");
  }, [t]);
  const [tree, setTree] = useState<TreeNode[] | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const reloadTree = useCallback(() => api.tree().then(setTree), []);
  useEffect(() => {
    void reloadTree();
  }, [reloadTree]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <BenchNav active="space" />
      <div className="app">
        <Sidebar
          tree={tree ?? []}
          onChange={reloadTree}
          onSearch={() => setSearchOpen(true)}
        />
        <main className="main">
          <Routes>
            <Route
              path="/"
              element={
                tree && tree.length > 0 ? (
                  <Navigate to={`/p/${tree[0].id}`} replace />
                ) : null
              }
            />
            <Route
              path="/p/:pageId"
              element={<PageView onTreeChange={reloadTree} />}
            />
          </Routes>
        </main>
        {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      </div>
    </>
  );
}
