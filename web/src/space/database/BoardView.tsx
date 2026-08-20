import { useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { useT } from "../../shared/useLocale";
import type { DbRow, Property } from "../api";
import { Chip } from "./cells";
import { groupRows, type BoardColumn } from "./viewLogic";

interface Props {
  rows: DbRow[];
  groupProperty: Property;
  cardProperty?: Property;
  onMove: (rowId: string, optionId: string | null) => void;
  /** Every row in the database, in stored order - the basis for a reorder. */
  allRows: DbRow[];
  onReorder: (orderedIds: string[]) => void;
  onReorderColumns: (optionIds: string[]) => void;
}

/** Columns are addressed as col:<id> so a drop on empty space still names its column. */
const COLUMN_PREFIX = "col:";
const columnId = (column: BoardColumn) =>
  `${COLUMN_PREFIX}${column.option?.id ?? "none"}`;
const optionIdOf = (id: string) => {
  const key = id.slice(COLUMN_PREFIX.length);
  return key === "none" ? null : key;
};
const isColumn = (id: string) => id.startsWith(COLUMN_PREFIX);

/** A card's chips: multi-select stores an array of option ids, select stores a single one. */
function toChips(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  return value ? [value as string] : [];
}

function CardBody({
  row,
  cardProperty,
  untitled,
}: {
  row: DbRow;
  cardProperty?: Property;
  untitled: string;
}) {
  const chips = toChips(cardProperty ? row.values[cardProperty.id] : undefined);
  return (
    <>
      <div className="board-card-title">{row.title || untitled}</div>
      {chips.length > 0 && cardProperty && (
        <div className="board-card-chips">
          {chips
            .map((id) => cardProperty.options.find((o) => o.id === id))
            .filter((o) => o !== undefined)
            .map((o) => (
              <Chip key={o.id} option={o} />
            ))}
        </div>
      )}
    </>
  );
}

function Card({
  row,
  cardProperty,
  justDragged,
  untitled,
}: {
  row: DbRow;
  cardProperty?: Property;
  justDragged: React.RefObject<boolean>;
  untitled: string;
}) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });
  return (
    <div
      ref={setNodeRef}
      className={`board-card${isDragging ? " dragging" : ""}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!isDragging && !justDragged.current) void navigate(`/p/${row.id}`);
      }}
      onKeyDown={(e) => {
        // dnd-kit's listeners own Space and the arrows for dragging; Enter opens the row.
        listeners?.onKeyDown(e);
        if (e.key === "Enter" && !e.defaultPrevented)
          void navigate(`/p/${row.id}`);
      }}
    >
      <CardBody row={row} cardProperty={cardProperty} untitled={untitled} />
    </div>
  );
}

function Column({
  column,
  groupProperty,
  cardProperty,
  justDragged,
  untitled,
  t,
}: {
  column: BoardColumn;
  groupProperty: Property;
  cardProperty?: Property;
  justDragged: React.RefObject<boolean>;
  untitled: string;
  t: ReturnType<typeof useT<"space">>;
}) {
  const id = columnId(column);
  // The whole column sorts horizontally, but only the handle starts that drag - dragging from
  // anywhere else would fight the cards inside it.
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id, data: { type: "column" } });

  return (
    <div
      ref={setNodeRef}
      className={`board-col${isOver ? " over" : ""}${isDragging ? " dragging" : ""}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-column={column.option?.name ?? "none"}
    >
      <div className="board-col-head">
        <span className="board-col-name">
          {/* The dot borrows the option's chip colours and paints itself in the text one. */}
          <span
            className={`board-col-dot chip-${column.option?.color ?? "gray"}`}
          />
          {column.option ? (
            column.option.name
          ) : (
            <span className="board-col-none">
              {t.i("boardNoGroup", { property: groupProperty.name })}
            </span>
          )}
        </span>
        <span className="board-count">{column.rows.length}</span>
        <button
          className="board-col-grip"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={t.i("reorderColumn", {
            name: column.option?.name ?? t("ungrouped"),
          })}
        >
          <GripVertical size={14} />
        </button>
      </div>
      <SortableContext
        items={column.rows.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="board-cards">
          {column.rows.map((row) => (
            <Card
              key={row.id}
              row={row}
              cardProperty={cardProperty}
              justDragged={justDragged}
              untitled={untitled}
            />
          ))}
          {column.rows.length === 0 && (
            <p className="board-col-empty">{t("boardDropRow")}</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function BoardView({
  rows,
  groupProperty,
  cardProperty,
  onMove,
  allRows,
  onReorder,
  onReorderColumns,
}: Props) {
  const t = useT("space");
  const untitled = t("untitled");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [dragging, setDragging] = useState<string | null>(null);
  // While a card is in flight the board shows where it would land, which is not what the rows
  // say yet. The override holds that arrangement until the drop is committed upstream.
  const [preview, setPreview] = useState<BoardColumn[] | null>(null);
  // A drop fires a click on the card underneath it; this suppresses that one navigation.
  const justDragged = useRef(false);

  const columns = preview ?? groupRows(rows, groupProperty);
  const draggingRow =
    dragging && !isColumn(dragging)
      ? rows.find((r) => r.id === dragging)
      : undefined;
  const draggingColumn =
    dragging && isColumn(dragging)
      ? columns.find((c) => columnId(c) === dragging)
      : undefined;

  const columnOf = (id: string) =>
    isColumn(id)
      ? columns.find((c) => columnId(c) === id)
      : columns.find((c) => c.rows.some((r) => r.id === id));

  const onDragStart = (event: DragStartEvent) => {
    setDragging(String(event.active.id));
  };

  /** Move the card between columns as it is dragged, so the gap opens where it will land. */
  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (isColumn(activeId) || activeId === overId) return;

    const from = columnOf(activeId);
    const to = columnOf(overId);
    if (!from || !to || from === to) return;

    const row = from.rows.find((r) => r.id === activeId)!;
    const index = isColumn(overId)
      ? to.rows.length
      : to.rows.findIndex((r) => r.id === overId);
    setPreview(
      columns.map((c) => {
        if (c === from) return { ...c, rows: c.rows.filter((r) => r !== row) };
        if (c !== to) return c;
        const next = [...c.rows];
        next.splice(index < 0 ? next.length : index, 0, row);
        return { ...c, rows: next };
      }),
    );
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDragging(null);
    justDragged.current = true;
    setTimeout(() => {
      justDragged.current = false;
    }, 0);

    if (!over) {
      setPreview(null);
      return;
    }
    const activeId = String(active.id);
    const overId = String(over.id);

    if (isColumn(activeId)) {
      commitColumnMove(activeId, overId);
      setPreview(null);
      return;
    }
    commitCardMove(activeId, overId);
    setPreview(null);
  };

  function commitColumnMove(activeId: string, overId: string) {
    const ids = columns
      .map((c) => c.option?.id)
      .filter((id) => id !== undefined);
    const from = ids.indexOf(optionIdOf(activeId) ?? "");
    const to = ids.indexOf(optionIdOf(isColumn(overId) ? overId : "") ?? "");
    if (from === -1 || to === -1 || from === to) return;
    onReorderColumns(arrayMove(ids, from, to));
  }

  function commitCardMove(activeId: string, overId: string) {
    const target = columnOf(overId);
    if (!target) return;
    const row = rows.find((r) => r.id === activeId);
    if (!row) return;

    const targetOption = target.option?.id ?? null;
    if ((row.values[groupProperty.id] ?? null) !== targetOption)
      onMove(activeId, targetOption);

    // Reorder against the full row list, so positions stay meaningful outside the board.
    if (!isColumn(overId) && activeId !== overId) {
      const ids = allRows.map((r) => r.id);
      const from = ids.indexOf(activeId);
      const to = ids.indexOf(overId);
      if (from !== -1 && to !== -1 && from !== to)
        onReorder(arrayMove(ids, from, to));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      // Cards are found by the pointer; columns fall back to their centres, which is what makes
      // a column slide out of the way while another one is dragged over it.
      collisionDetection={
        dragging && isColumn(dragging) ? closestCenter : pointerWithin
      }
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setDragging(null);
        setPreview(null);
      }}
    >
      <SortableContext
        items={columns.map(columnId)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="board" data-testid="board">
          {columns.map((column) => (
            <Column
              key={columnId(column)}
              column={column}
              groupProperty={groupProperty}
              cardProperty={cardProperty}
              justDragged={justDragged}
              untitled={untitled}
              t={t}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {draggingRow && (
          <div className="board-card lifted">
            <CardBody
              row={draggingRow}
              cardProperty={cardProperty}
              untitled={untitled}
            />
          </div>
        )}
        {draggingColumn && (
          <div className="board-col lifted">
            <div className="board-col-head">
              <span className="board-col-name">
                {draggingColumn.option?.name ??
                  t.i("boardNoGroup", { property: groupProperty.name })}
              </span>
              <span className="board-count">{draggingColumn.rows.length}</span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
