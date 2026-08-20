import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useLocale } from "../../shared/useLocale";
import { api, type Block } from "../api";
import { caretOffset, focusBlock, selectionCollapsed } from "./caret";
import { filterBlockTypes } from "./blockTypes";
import BlockRow from "./BlockRow";
import SlashMenu from "./SlashMenu";
import { applyReorder } from "./reorder";

const LIST_TYPES = new Set(["bulleted", "numbered", "todo"]);
const EMPTY_ENTER_RESETS = new Set([
  "bulleted",
  "numbered",
  "todo",
  "quote",
  "callout",
]);

interface SlashState {
  blockId: string;
  index: number;
  query: string;
  selected: number;
  anchor: { left: number; top: number };
}

interface Props {
  pageId: string;
  initialBlocks: Block[];
}

export default function Editor({ pageId, initialBlocks }: Props) {
  const { t } = useLocale();
  const [blocks, setBlocks] = useState<Block[]>(() =>
    initialBlocks.map((b) => {
      // Typed as an object, but it arrives as JSON and an older block may hold anything.
      const content: unknown = b.content;
      const usable =
        typeof content === "object" &&
        content !== null &&
        !Array.isArray(content);
      return usable ? b : { ...b, content: {} };
    }),
  );
  const blocksRef = useRef(blocks);
  const [versions, setVersions] = useState<Record<string, number>>({});
  const [slash, setSlash] = useState<SlashState | null>(null);
  const slashRef = useRef(slash);

  // These mirror the latest render for the callbacks and the pagehide flush to read. Written after
  // the render rather than during it, which is what React expects of a ref.
  useEffect(() => {
    blocksRef.current = blocks;
    slashRef.current = slash;
  });
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const pendingFocus = useRef<{ id: string; offset: number | "end" } | null>(
    null,
  );
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  /** Serialize block mutations so they reach the server in the order they happened. */
  const enqueue = useCallback((op: () => Promise<unknown>) => {
    queue.current = queue.current.then(op, op);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  useEffect(() => {
    const flushAll = () => {
      for (const id of [...timers.current.keys()]) {
        clearTimeout(timers.current.get(id));
        timers.current.delete(id);
        const block = blocksRef.current.find((b) => b.id === id);
        if (block) {
          void fetch(`/api/space/blocks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: block.content }),
            keepalive: true,
          });
        }
      }
    };
    window.addEventListener("pagehide", flushAll);
    return () => {
      flushAll();
      window.removeEventListener("pagehide", flushAll);
    };
  }, []);

  useEffect(() => {
    if (blocksRef.current.length === 0) {
      const id = crypto.randomUUID();
      setBlocks([
        {
          id,
          page_id: pageId,
          type: "paragraph",
          content: { text: "" },
          position: 0,
        },
      ]);
      enqueue(() =>
        api.createBlock(pageId, {
          id,
          type: "paragraph",
          content: { text: "" },
          index: 0,
        }),
      );
    }
  }, [pageId, enqueue]);

  useLayoutEffect(() => {
    if (pendingFocus.current) {
      const { id, offset } = pendingFocus.current;
      pendingFocus.current = null;
      focusBlock(id, offset);
    }
  });

  const flushSave = useCallback(
    (id: string) => {
      const timer = timers.current.get(id);
      if (timer) clearTimeout(timer);
      timers.current.delete(id);
      const block = blocksRef.current.find((b) => b.id === id);
      if (block) enqueue(() => api.updateBlock(id, { content: block.content }));
    },
    [enqueue],
  );

  const scheduleSave = useCallback(
    (id: string) => {
      const timer = timers.current.get(id);
      if (timer) clearTimeout(timer);
      timers.current.set(
        id,
        setTimeout(() => flushSave(id), 500),
      );
    },
    [flushSave],
  );

  const setText = useCallback(
    (id: string, text: string, programmatic = false) => {
      setBlocks((bs) =>
        bs.map((b) =>
          b.id === id ? { ...b, content: { ...b.content, text } } : b,
        ),
      );
      if (programmatic) {
        setVersions((v) => ({ ...v, [id]: (v[id] ?? 0) + 1 }));
        const timer = timers.current.get(id);
        if (timer) clearTimeout(timer);
        timers.current.delete(id);
        const block = blocksRef.current.find((b) => b.id === id);
        enqueue(() =>
          api.updateBlock(id, { content: { ...block?.content, text } }),
        );
      } else {
        scheduleSave(id);
      }
    },
    [scheduleSave, enqueue],
  );

  const insertBlock = useCallback(
    (
      index: number,
      type: string,
      content: Record<string, unknown>,
      focusOffset: number | "end" | null = 0,
    ) => {
      const id = crypto.randomUUID();
      setBlocks((bs) => {
        const next = [...bs];
        next.splice(index, 0, {
          id,
          page_id: pageId,
          type,
          content,
          position: index,
        });
        return next;
      });
      enqueue(() => api.createBlock(pageId, { id, type, content, index }));
      if (focusOffset !== null)
        pendingFocus.current = { id, offset: focusOffset };
      return id;
    },
    [pageId, enqueue],
  );

  const removeBlock = useCallback(
    (id: string) => {
      setBlocks((bs) => bs.filter((b) => b.id !== id));
      enqueue(() => api.deleteBlock(id));
    },
    [enqueue],
  );

  const convertType = useCallback(
    (id: string, type: string, content?: Record<string, unknown>) => {
      setBlocks((bs) =>
        bs.map((b) =>
          b.id === id ? { ...b, type, content: content ?? b.content } : b,
        ),
      );
      const block = blocksRef.current.find((b) => b.id === id);
      enqueue(() =>
        api.updateBlock(id, { type, content: content ?? block?.content }),
      );
    },
    [enqueue],
  );

  const handleEnter = useCallback(
    (id: string, el: HTMLElement, shift: boolean) => {
      if (shift) return false;
      const bs = blocksRef.current;
      const i = bs.findIndex((b) => b.id === id);
      const block = bs[i];
      const text = (block.content.text as string | undefined) ?? "";
      if (text === "" && EMPTY_ENTER_RESETS.has(block.type)) {
        convertType(id, "paragraph", { text: "" });
        return true;
      }
      const off = caretOffset(el);
      const before = text.slice(0, off);
      const after = text.slice(off);
      if (before !== text) setText(id, before, true);
      const newType = LIST_TYPES.has(block.type) ? block.type : "paragraph";
      const content: Record<string, unknown> = { text: after };
      if (newType === "todo") content.checked = false;
      insertBlock(i + 1, newType, content, 0);
      return true;
    },
    [convertType, setText, insertBlock],
  );

  const handleBackspace = useCallback(
    (id: string, e: React.KeyboardEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (caretOffset(el) !== 0 || !selectionCollapsed()) return;
      const bs = blocksRef.current;
      const i = bs.findIndex((b) => b.id === id);
      const block = bs[i];
      const text = (block.content.text as string | undefined) ?? "";
      // Typed as always present, but at the first block there is nothing before it.
      const prev: Block | undefined = i > 0 ? bs[i - 1] : undefined;

      if (prev?.type === "divider") {
        e.preventDefault();
        removeBlock(prev.id);
        return;
      }
      if (text === "") {
        if (block.type !== "paragraph") {
          e.preventDefault();
          convertType(id, "paragraph", { text: "" });
          return;
        }
        if (bs.length === 1) return;
        e.preventDefault();
        removeBlock(id);
        if (prev) pendingFocus.current = { id: prev.id, offset: "end" };
        else if (bs[i + 1])
          pendingFocus.current = { id: bs[i + 1].id, offset: 0 };
        return;
      }
      if (prev && prev.type !== "divider") {
        e.preventDefault();
        const prevText = (prev.content.text as string | undefined) ?? "";
        setText(prev.id, prevText + text, true);
        removeBlock(id);
        pendingFocus.current = { id: prev.id, offset: prevText.length };
      }
    },
    [removeBlock, convertType, setText],
  );

  const pickSlash = useCallback(
    (type: string) => {
      const s = slashRef.current;
      if (!s) return;
      setSlash(null);
      const bs = blocksRef.current;
      const i = bs.findIndex((b) => b.id === s.blockId);
      if (i < 0) return;
      const block = bs[i];
      const text = (block.content.text as string | undefined) ?? "";
      const newText =
        text.slice(0, s.index) + text.slice(s.index + 1 + s.query.length);
      if (type === "divider") {
        convertType(block.id, "divider", {});
        insertBlock(i + 1, "paragraph", { text: newText }, 0);
        return;
      }
      const content: Record<string, unknown> = { text: newText };
      if (type === "todo") content.checked = false;
      convertType(block.id, type, content);
      setVersions((v) => ({ ...v, [block.id]: (v[block.id] ?? 0) + 1 }));
      pendingFocus.current = { id: block.id, offset: s.index };
    },
    [convertType, insertBlock],
  );

  const onTextInput = useCallback(
    (id: string, text: string, caret: number) => {
      setText(id, text);
      const s = slashRef.current;
      if (s?.blockId === id) {
        // the filter runs from the slash to the caret, so text after the caret is left alone
        const end = caret > s.index ? caret : undefined;
        if (text[s.index] !== "/") setSlash(null);
        else
          setSlash({
            ...s,
            query: text.slice(s.index + 1, end ?? text.length),
            selected: 0,
          });
      }
    },
    [setText],
  );

  /** The slash menu's own keys while it is open. True means it consumed the event. */
  const handleSlashKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, s: SlashState) => {
      const items = filterBlockTypes(s.query, t);
      if (e.key === "ArrowDown" && items.length > 0) {
        e.preventDefault();
        setSlash({ ...s, selected: (s.selected + 1) % items.length });
        return true;
      }
      if (e.key === "ArrowUp" && items.length > 0) {
        e.preventDefault();
        setSlash({
          ...s,
          selected: (s.selected - 1 + items.length) % items.length,
        });
        return true;
      }
      if (e.key === "Enter" && items[s.selected]) {
        e.preventDefault();
        pickSlash(items[s.selected].type);
        return true;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSlash(null);
        return true;
      }
      return false;
    },
    [pickSlash, t],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, id: string) => {
      const s = slashRef.current;
      if (s?.blockId === id && handleSlashKey(e, s)) return;
      if (e.key === "/" && !s) {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        setSlash({
          blockId: id,
          index: caretOffset(el),
          query: "",
          selected: 0,
          anchor: { left: rect.left, top: rect.bottom },
        });
        return;
      }
      if (e.key === "Enter") {
        if (handleEnter(id, e.currentTarget, e.shiftKey)) e.preventDefault();
        return;
      }
      if (e.key === "Backspace") handleBackspace(id, e);
    },
    [handleSlashKey, handleEnter, handleBackspace],
  );

  const onBlur = useCallback(
    (id: string) => {
      if (timers.current.has(id)) flushSave(id);
    },
    [flushSave],
  );

  const onToggleTodo = useCallback(
    (id: string, checked: boolean) => {
      setBlocks((bs) => {
        const next = bs.map((b) =>
          b.id === id ? { ...b, content: { ...b.content, checked } } : b,
        );
        const block = next.find((b) => b.id === id);
        if (block)
          enqueue(() => api.updateBlock(id, { content: block.content }));
        return next;
      });
    },
    [enqueue],
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setBlocks((bs) => {
        const next = applyReorder(bs, String(active.id), String(over.id));
        if (next !== bs) {
          const ids = next.map((b) => b.id);
          enqueue(() => api.reorderBlocks(pageId, ids));
        }
        return next;
      });
    },
    [pageId, enqueue],
  );

  const onBodyClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      const bs = blocksRef.current;
      const last = bs.at(-1);
      if (
        last?.type === "paragraph" &&
        !((last.content.text as string | undefined) ?? "")
      ) {
        focusBlock(last.id, "end");
      } else {
        insertBlock(bs.length, "paragraph", { text: "" }, 0);
      }
    },
    [insertBlock],
  );

  // An ordered list restarts at 1 whenever a non-numbered block interrupts it. Computed up front
  // rather than by mutating a counter while mapping, which reassigns across renders.
  const ordinals = blocks.reduce<number[]>((acc, block) => {
    const running = acc.at(-1) ?? 0;
    acc.push(block.type === "numbered" ? running + 1 : 0);
    return acc;
  }, []);

  return (
    <div
      role="presentation"
      className="editor"
      onClick={onBodyClick}
      data-testid="editor-body"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block, i) => {
            return (
              <BlockRow
                key={block.id}
                block={block}
                number={ordinals[i]}
                version={versions[block.id] ?? 0}
                onTextInput={onTextInput}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                onToggleTodo={onToggleTodo}
              />
            );
          })}
        </SortableContext>
      </DndContext>
      {slash && (
        <SlashMenu
          query={slash.query}
          selected={slash.selected}
          anchor={slash.anchor}
          onPick={pickSlash}
          onHover={(i) =>
            setSlash((cur) => (cur ? { ...cur, selected: i } : cur))
          }
        />
      )}
    </div>
  );
}
