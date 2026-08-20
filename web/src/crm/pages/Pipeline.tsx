import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useLocale, useT } from "../../shared/useLocale";
import { api } from "../api";
import { useFetch } from "../hooks";
import { dealStageLabel } from "../i18n";
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
  const { locale } = useLocale();
  const tc = useT("crm");
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
          <div className="deal-org">{orgName || tc("noOrganization")}</div>
          <div className="deal-figures">
            <span className="deal-value">
              {formatMoney(deal.value, locale)}
            </span>
            <span className="deal-prob">{deal.probability}%</span>
          </div>
          <div className="deal-meta">
            <span className={`deal-date${late ? " late" : ""}`}>
              {formatDateShort(deal.close_date, locale)}
            </span>
            <span className="deal-expected">
              {formatMoneyCompact(expectedValue(deal), locale)}{" "}
              {tc("expectedSuffix")}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function Pipeline() {
  const { locale } = useLocale();
  const tc = useT("crm");
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

  function onDragEnd({ draggableId, destination, source }: DropResult) {
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
        title={tc("pipelineTitle")}
        sub={tc("pipelineSub")}
      >
        <div className="pipeline-totals">
          <div className="total-block">
            <span className="total-label">{tc("totalPipeline")}</span>
            <span className="total-value" data-testid="pipeline-total">
              {formatMoney(sumValue(open), locale)}
            </span>
          </div>
          <div className="total-block">
            <span className="total-label">{tc("expectedRevenue")}</span>
            <span
              className="total-value accent"
              data-testid="pipeline-expected"
            >
              {formatMoney(sumExpected(open), locale)}
            </span>
          </div>
        </div>
      </PageHeader>
      <DragDropContext onDragEnd={onDragEnd}>
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
                        {dealStageLabel(tc, stage)}
                      </span>
                      <span className="col-count">{inStage.length}</span>
                    </div>
                    <div className="board-column-totals">
                      <span data-testid={`stage-total-${stage}`}>
                        {formatMoney(total, locale)}
                      </span>
                      <span
                        className="col-expected"
                        data-testid={`stage-expected-${stage}`}
                      >
                        {formatMoney(expected, locale)}
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
                        <p className="board-empty">{tc("dropDealHere")}</p>
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
