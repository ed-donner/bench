import {
  DragDropContext,
  Draggable,
  Droppable,
  DragStart,
  DragUpdate,
  DropResult,
  ResponderProvided,
} from "@hello-pangea/dnd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../api";
import { useFetch } from "../hooks";
import {
  DEAL_STAGES,
  Deal,
  DealStage,
  Organization,
  STAGE_COLOR,
  boardOrder,
  expectedValue,
  isOpen,
  moveDeal,
  sumExpected,
  sumValue,
} from "../types";
import { formatDateShort, formatMoney, formatMoneyCompact } from "../format";
import PageHeader from "../components/PageHeader";
import { IconPipeline } from "../components/Icons";
import { stageLabel, useT } from "../strings";

const today = () => new Date().toISOString().slice(0, 10);

function DealCard({
  deal,
  index,
  orgName,
}: {
  deal: Deal;
  index: number;
  orgName: string;
}) {
  const t = useT();
  const navigate = useNavigate();
  const open = () => void navigate(`/deals/${deal.id}`);
  const late = isOpen(deal) && (deal.close_date ?? "") < today();
  return (
    <Draggable draggableId={String(deal.id)} index={index}>
      {(dragProvided, dragSnapshot) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          // Both come from dragHandleProps too, but ESLint cannot see through the spread, and
          // these are the values it already sets.
          role="button"
          tabIndex={0}
          className={`deal-card${dragSnapshot.isDragging ? " dragging" : ""}`}
          onClick={(e) => {
            if (!e.defaultPrevented) open();
          }}
          onKeyDown={(e) => {
            // The library drags from a global keyboard sensor rather than a handler here, so
            // Space and the arrows still reach it; Enter is ours and opens the deal.
            if (e.key === "Enter") open();
          }}
        >
          <div className="deal-name">{deal.name}</div>
          <div className="deal-org">{orgName || t("pipeline.noOrg")}</div>
          <div className="deal-figures">
            <span className="deal-value">{formatMoney(deal.value)}</span>
            <span className="deal-prob">{deal.probability}%</span>
          </div>
          <div className="deal-meta">
            <span className={`deal-date${late ? " late" : ""}`}>
              {formatDateShort(deal.close_date)}
            </span>
            <span className="deal-expected">
              {t("pipeline.expectedShort", {
                value: formatMoneyCompact(expectedValue(deal)),
              })}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function Pipeline() {
  const t = useT();
  const { data: fetched } = useFetch<Deal[]>("/api/crm/deals");
  // Once a card has been dropped the local order wins; until then the fetched list is what shows.
  // Derived rather than copied into state by an effect, which would render twice on every load.
  const [moved, setMoved] = useState<Deal[] | null>(null);
  const ordered = useMemo(() => boardOrder(fetched ?? []), [fetched]);
  const deals = moved ?? ordered;
  const { data: orgs } = useFetch<Organization[]>("/api/crm/organizations");
  const orgName = useMemo(
    () => new Map((orgs ?? []).map((o) => [o.id, o.name])),
    [orgs],
  );

  // The library's own screen-reader announcements are English, so the board says its own.
  const dealName = (id: string) =>
    deals.find((d) => d.id === Number(id))?.name ?? "";
  const where = ({
    droppableId,
    index,
  }: {
    droppableId: string;
    index: number;
  }) =>
    t("pipeline.sr.where", {
      stage: stageLabel(droppableId as DealStage),
      position: index + 1,
    });

  function onDragStart(start: DragStart, provided: ResponderProvided) {
    provided.announce(
      t("pipeline.sr.lifted", {
        name: dealName(start.draggableId),
        where: where(start.source),
      }),
    );
  }

  function onDragUpdate(update: DragUpdate, provided: ResponderProvided) {
    provided.announce(
      update.destination
        ? t("pipeline.sr.moved", { where: where(update.destination) })
        : t("pipeline.sr.outside"),
    );
  }

  function onDragEnd(result: DropResult, provided: ResponderProvided) {
    const { draggableId, destination, source } = result;
    provided.announce(
      destination
        ? t("pipeline.sr.dropped", {
            name: dealName(draggableId),
            where: where(destination),
          })
        : t("pipeline.sr.cancelled", { where: where(source) }),
    );
    if (!destination) return;
    const samePlace =
      destination.droppableId === source.droppableId &&
      destination.index === source.index;
    if (samePlace) return;
    const stage = destination.droppableId as DealStage;
    const id = Number(draggableId);
    // Mirror what the server does, so the card and the totals settle before the reply arrives.
    setMoved(moveDeal(deals, id, stage, destination.index));
    void api.patch(`/api/crm/deals/${id}/stage`, {
      stage,
      index: destination.index,
    });
  }

  const open = deals.filter(isOpen);

  return (
    <>
      <PageHeader
        icon={<IconPipeline size={20} />}
        title={t("nav.pipeline")}
        sub={t("pipeline.sub")}
      >
        <div className="pipeline-totals">
          <div className="total-block">
            <span className="total-label">{t("pipeline.total")}</span>
            <span className="total-value" data-testid="pipeline-total">
              {formatMoney(sumValue(open))}
            </span>
          </div>
          <div className="total-block">
            <span className="total-label">{t("dash.expected")}</span>
            <span
              className="total-value accent"
              data-testid="pipeline-expected"
            >
              {formatMoney(sumExpected(open))}
            </span>
          </div>
        </div>
      </PageHeader>
      <DragDropContext
        onDragStart={onDragStart}
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
        dragHandleUsageInstructions={t("pipeline.sr.instructions")}
      >
        <div className="board">
          {DEAL_STAGES.map((stage) => {
            const inStage = deals.filter((d) => d.stage === stage);
            const total = sumValue(inStage);
            const expected = sumExpected(inStage);
            return (
              <Droppable droppableId={stage} key={stage}>
                {(provided, snapshot) => (
                  <div
                    className={`board-column${snapshot.isDraggingOver ? " drag-over" : ""}`}
                    data-stage={stage}
                    style={
                      { "--stage": STAGE_COLOR[stage] } as React.CSSProperties
                    }
                  >
                    <div className="board-column-header">
                      <span className="col-title">
                        <span className="col-dot" />
                        {stageLabel(stage)}
                      </span>
                      <span className="col-count">{inStage.length}</span>
                    </div>
                    <div className="board-column-totals">
                      <span data-testid={`stage-total-${stage}`}>
                        {formatMoney(total)}
                      </span>
                      <span
                        className="col-expected"
                        data-testid={`stage-expected-${stage}`}
                      >
                        {formatMoney(expected)}
                      </span>
                    </div>
                    {/* The scrolling list is the drop target, so a long column auto-scrolls as
                        you drag near its edge. */}
                    <div
                      className="board-cards"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {inStage.map((deal, index) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          index={index}
                          orgName={
                            orgName.get(deal.organization_id ?? -1) ?? ""
                          }
                        />
                      ))}
                      {provided.placeholder}
                      {inStage.length === 0 && !snapshot.isDraggingOver && (
                        <p className="board-empty">{t("pipeline.drop")}</p>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </>
  );
}
