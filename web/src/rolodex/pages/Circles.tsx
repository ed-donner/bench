import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { UsersRound } from "lucide-react";
import { useLocale } from "../../shared/useLocale";
import { useStore } from "../store";
import { api } from "../api";
import type { Circle, PersonComputed } from "../types";
import { Avatar } from "../components/Avatar";
import { StatusBadge } from "../components/Chips";
import { EmptyState } from "../components/Modal";
import { circleMeta, relativeDays } from "../format";
import { useToast } from "../store";

const CIRCLE_DOTS: Record<Circle, string> = {
  inner: "var(--purple)",
  close: "var(--blue)",
  wider: "var(--amber)",
  distant: "var(--slate)",
};

function PersonCard({
  person,
  dragging,
  t,
}: {
  person: PersonComputed;
  dragging?: boolean;
  t: ReturnType<typeof useLocale>["t"];
}) {
  return (
    <div className={`person-card${dragging ? " dragging" : ""}`}>
      <Avatar name={person.name} photo={person.photo} />
      <div className="grow">
        <div className="person-card-top">
          <span className="name">{person.name}</span>
          <StatusBadge status={person.status} />
        </div>
        <div className="meta">
          {person.last_contacted
            ? t("circles.contacted", {
                when: relativeDays(t, person.last_contacted),
              })
            : t("relative.neverContacted")}
        </div>
      </div>
    </div>
  );
}

function DraggableCard({
  person,
  t,
}: {
  person: PersonComputed;
  t: ReturnType<typeof useLocale>["t"];
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: person.id,
    data: { person },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ touchAction: "none" }}
    >
      <PersonCard person={person} dragging={isDragging} t={t} />
    </div>
  );
}

function Column({
  circle,
  people,
  t,
}: {
  circle: Circle;
  people: PersonComputed[];
  t: ReturnType<typeof useLocale>["t"];
}) {
  const meta = circleMeta(t, circle);
  const { setNodeRef, isOver } = useDroppable({ id: `col-${circle}` });
  const overdue = people.filter((p) => p.status === "overdue").length;

  return (
    <div className={`board-col${isOver ? " drag-over" : ""}`} ref={setNodeRef}>
      <div className="board-col-header">
        <div className="board-col-title">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: CIRCLE_DOTS[circle],
              display: "inline-block",
            }}
          />
          {meta.label}
          <span className="board-col-count">{people.length}</span>
        </div>
        <div className="board-col-meta">
          <span>{meta.cadenceDescription.toLowerCase()}</span>
          {overdue > 0 && (
            <span style={{ color: "var(--red)", fontWeight: 700 }}>
              {t("circles.overdueCount", { count: overdue })}
            </span>
          )}
        </div>
      </div>
      <div className="board-cards">
        {people.length === 0 ? (
          <div className="empty" style={{ padding: "18px 8px" }}>
            {t("circles.dropHere")}
          </div>
        ) : (
          people.map((p) => <DraggableCard key={p.id} person={p} t={t} />)
        )}
      </div>
    </div>
  );
}

export default function Circles() {
  const { t } = useLocale();
  const { people, loaded, refresh } = useStore();
  const toast = useToast();
  const [activePerson, setActivePerson] = useState<PersonComputed | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const byCircle = useMemo(() => {
    const map: Record<Circle, PersonComputed[]> = {
      inner: [],
      close: [],
      wider: [],
      distant: [],
    };
    for (const p of people) map[p.circle].push(p);
    const ORDER: Partial<Record<PersonComputed["status"], number>> = {
      overdue: 0,
      due_soon: 1,
    };
    const rank = (p: PersonComputed) => ORDER[p.status] ?? 2;
    for (const c of Object.keys(map) as Circle[]) {
      map[c].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
    }
    return map;
  }, [people]);

  const onDragStart = (e: DragStartEvent) => {
    setActivePerson(
      (e.active.data.current?.person as PersonComputed | undefined) ?? null,
    );
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActivePerson(null);
    const person = e.active.data.current?.person as PersonComputed | undefined;
    const target = e.over?.id;
    if (!person || !target) return;
    const circle = String(target).replace("col-", "") as Circle;
    if (circle === person.circle) return;
    await api.updatePerson(person.id, { circle });
    await refresh();
    const meta = circleMeta(t, circle);
    toast(
      t("circles.movedToast", {
        firstName: person.name.split(" ")[0],
        circle: meta.label,
        cadence: meta.cadenceDescription.toLowerCase(),
      }),
    );
  };

  return (
    <div className="page wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span
              className="icon-sq"
              style={{
                background: "var(--purple-soft)",
                color: "var(--purple)",
              }}
            >
              <UsersRound size={19} />
            </span>
            {t("circles.title")}
          </h1>
          <p className="page-desc">{t("circles.desc")}</p>
        </div>
        <div className="page-actions">
          <Link className="btn" to="/people">
            {t("circles.openPeople")}
          </Link>
        </div>
      </div>

      {!loaded ? (
        <div className="card card-pad muted">{t("circles.loading")}</div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={(e) => void onDragEnd(e)}
        >
          <div className="board">
            {(["inner", "close", "wider", "distant"] as Circle[]).map((c) => (
              <Column key={c} circle={c} people={byCircle[c]} t={t} />
            ))}
          </div>
          <DragOverlay>
            {activePerson && (
              <div className="drag-overlay-card" style={{ width: 260 }}>
                <PersonCard person={activePerson} t={t} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <div
        className="row wrap"
        style={{ marginTop: 18, gap: 20, padding: "0 2px" }}
      >
        {(["inner", "close", "wider", "distant"] as Circle[]).map((c) => {
          const meta = circleMeta(t, c);
          return (
            <div key={c} className="row" style={{ gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: CIRCLE_DOTS[c],
                }}
              />
              <strong>{meta.label}</strong>
              <span className="muted small">{meta.blurb}</span>
            </div>
          );
        })}
      </div>

      {loaded && people.length === 0 && (
        <EmptyState icon={<UsersRound />}>
          {t("circles.emptyPeople")}
        </EmptyState>
      )}
    </div>
  );
}
