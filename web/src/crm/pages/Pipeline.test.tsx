import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
  DroppableStateSnapshot,
  DragStart,
  DragUpdate,
  DropResult,
  ResponderProvided,
} from "@hello-pangea/dnd";
import Pipeline from "./Pipeline";
import { api } from "../api";
import { setLang } from "../../shared/i18n";
import { deal, org, routes } from "../test/helpers";

/**
 * dnd measures the boxes it drags, and jsdom lays nothing out, so the real library cannot drag
 * here - the keyboard drag is an e2e test. Stubbing it renders the board and hands back the
 * onDragEnd the page passes in, which is where the optimistic update lives.
 */
interface Dropped {
  start: (start: DragStart) => void;
  update: (update: DragUpdate) => void;
  end: (result: DropResult) => void;
  announced: string[];
}

const { dropped } = vi.hoisted(() => {
  const dropped: Dropped = {
    start: () => undefined,
    update: () => undefined,
    end: () => undefined,
    announced: [],
  };
  return { dropped };
});

vi.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({
    children,
    onDragStart,
    onDragUpdate,
    onDragEnd,
  }: {
    children: React.ReactNode;
    onDragStart: (start: DragStart, provided: ResponderProvided) => void;
    onDragUpdate: (update: DragUpdate, provided: ResponderProvided) => void;
    onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  }) => {
    const provided = {
      announce: (message: string) => dropped.announced.push(message),
    };
    dropped.start = (start) => {
      onDragStart(start, provided);
    };
    dropped.update = (update) => {
      onDragUpdate(update, provided);
    };
    dropped.end = (result) => {
      onDragEnd(result, provided);
    };
    return <div>{children}</div>;
  },
  Droppable: ({
    children,
  }: {
    children: (
      provided: DroppableProvided,
      snapshot: DroppableStateSnapshot,
    ) => React.ReactNode;
  }) =>
    children(
      {
        innerRef: () => undefined,
        droppableProps: {},
        placeholder: null,
      } as unknown as DroppableProvided,
      { isDraggingOver: false } as DroppableStateSnapshot,
    ),
  Draggable: ({
    children,
  }: {
    children: (
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot,
    ) => React.ReactNode;
  }) =>
    children(
      {
        innerRef: () => undefined,
        draggableProps: {},
        dragHandleProps: {},
      } as unknown as DraggableProvided,
      { isDragging: false } as DraggableStateSnapshot,
    ),
}));

vi.mock("../api", () => ({
  api: { get: vi.fn(), patch: vi.fn() },
}));

const orgs = [org({ id: 1, name: "Bluepeak Software" })];
const deals = [
  deal({
    id: 1,
    name: "Platform rollout",
    stage: "Proposal",
    value: 40000,
    probability: 50,
  }),
  deal({
    id: 2,
    name: "Support renewal",
    organization_id: null,
    stage: "New",
    value: 10000,
    probability: 10,
  }),
  deal({ id: 3, name: "Old contract", stage: "Won", value: 90000 }),
  // Arrives out of order and second in its column, so the board has both to sort and to reorder.
  deal({
    id: 5,
    name: "Renewal",
    stage: "New",
    value: 4000,
    probability: 10,
    board_order: 1,
  }),
];

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(
    routes({ "/api/crm/deals": deals, "/api/crm/organizations": orgs }),
  );
  vi.mocked(api.patch).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

function show() {
  render(
    <MemoryRouter initialEntries={["/pipeline"]}>
      <Routes>
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/deals/:id" element={<h1>Detail page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

const column = (stage: string) =>
  document.querySelector<HTMLElement>(`[data-stage="${stage}"]`)!;

const cardNames = (stage: string) =>
  [...column(stage).querySelectorAll(".deal-name")].map((n) => n.textContent);

const drag = (id: number, to: string, from = "Proposal") => ({
  draggableId: String(id),
  source: { droppableId: from, index: 0 },
  destination: { droppableId: to, index: 0 },
});

describe("Pipeline", () => {
  it("puts each deal in its stage column and counts them", async () => {
    show();
    await screen.findByText("Platform rollout");

    expect(
      within(column("Proposal")).getByText("Platform rollout"),
    ).toBeInTheDocument();
    expect(
      within(column("New")).getByText("Support renewal"),
    ).toBeInTheDocument();
    expect(within(column("Proposal")).getByText("1")).toBeInTheDocument();
    expect(within(column("Qualified")).getByText("0")).toBeInTheDocument();
  });

  it("shows a card's organization, value, probability and expected value", async () => {
    show();
    const card: HTMLElement = (
      await screen.findByText("Platform rollout")
    ).closest(".deal-card")!;

    expect(within(card).getByText("Bluepeak Software")).toBeInTheDocument();
    expect(within(card).getByText("$40,000")).toBeInTheDocument();
    expect(within(card).getByText("50%")).toBeInTheDocument();
    expect(within(card).getByText("$20k expected")).toBeInTheDocument();
    expect(within(card).getByText("Sep 30")).toBeInTheDocument();
  });

  it("totals only the open stages at the top, but every stage in its own column", async () => {
    show();
    expect(await screen.findByTestId("pipeline-total")).toHaveTextContent(
      "$54,000",
    );
    expect(screen.getByTestId("pipeline-expected")).toHaveTextContent(
      "$21,400",
    );
    expect(screen.getByTestId("stage-total-Won")).toHaveTextContent("$90,000");
  });

  it("opens a deal when its card is clicked", async () => {
    show();
    await userEvent.click(await screen.findByText("Platform rollout"));
    expect(
      screen.getByRole("heading", { name: "Detail page" }),
    ).toBeInTheDocument();
  });

  it("opens a deal from the keyboard with Enter", async () => {
    show();
    const card: HTMLElement = (
      await screen.findByText("Platform rollout")
    ).closest(".deal-card")!;
    card.focus();
    await userEvent.keyboard("{Enter}");
    expect(
      screen.getByRole("heading", { name: "Detail page" }),
    ).toBeInTheDocument();
  });

  it("moves the card and re-bases its probability before the server replies", async () => {
    show();
    await screen.findByText("Platform rollout");

    dropped.end(drag(1, "Negotiation") as DropResult);

    expect(
      await within(column("Negotiation")).findByText("Platform rollout"),
    ).toBeInTheDocument();
    expect(within(column("Negotiation")).getByText("75%")).toBeInTheDocument();
    expect(screen.getByTestId("pipeline-expected")).toHaveTextContent(
      "$31,400",
    );
    expect(api.patch).toHaveBeenCalledWith("/api/crm/deals/1/stage", {
      stage: "Negotiation",
      index: 0,
    });
    expect(dropped.announced.at(-1)).toBe(
      "Dropped Platform rollout in Negotiation, position 1",
    );
  });

  it("names the stages and announces a drop in Spanish", async () => {
    setLang("es");
    show();
    await screen.findByText("Platform rollout");
    expect(screen.getByText("Negociación")).toBeInTheDocument();

    dropped.end(drag(1, "Negotiation") as DropResult);

    expect(dropped.announced.at(-1)).toBe(
      "Platform rollout soltado en Negociación, posición 1",
    );
  });

  it("tells a screen reader where a lifted card is, and when it leaves the board", async () => {
    show();
    await screen.findByText("Platform rollout");
    const source = { droppableId: "Proposal", index: 0 };

    dropped.start({ draggableId: "1", source } as DragStart);
    expect(dropped.announced.at(-1)).toMatch(
      /^Picked up Platform rollout from Proposal, position 1\./,
    );
    dropped.update({
      draggableId: "1",
      source,
      destination: { droppableId: "Won", index: 2 },
    } as DragUpdate);
    expect(dropped.announced.at(-1)).toBe("Moving to Won, position 3");
    dropped.update({
      draggableId: "1",
      source,
      destination: null,
    } as DragUpdate);
    expect(dropped.announced.at(-1)).toBe("Not over a column");
    dropped.end({ draggableId: "1", source, destination: null } as DropResult);
    expect(dropped.announced.at(-1)).toBe(
      "Move cancelled. Back in Proposal, position 1",
    );
  });

  it("keeps a card where it is dropped within its own column", async () => {
    show();
    await screen.findByText("Renewal");

    dropped.end({
      draggableId: "5",
      source: { droppableId: "New", index: 1 },
      destination: { droppableId: "New", index: 0 },
    } as DropResult);

    await waitFor(() =>
      expect(cardNames("New")).toEqual(["Renewal", "Support renewal"]),
    );
    expect(api.patch).toHaveBeenCalledWith("/api/crm/deals/5/stage", {
      stage: "New",
      index: 0,
    });
  });

  it("ignores a drop outside a column, or back where it started", async () => {
    show();
    await screen.findByText("Platform rollout");

    dropped.end({
      draggableId: "1",
      source: { droppableId: "Proposal", index: 0 },
      destination: null,
    } as DropResult);
    dropped.end(drag(1, "Proposal") as DropResult);

    expect(api.patch).not.toHaveBeenCalled();
    expect(
      within(column("Proposal")).getByText("Platform rollout"),
    ).toBeInTheDocument();
  });
});
