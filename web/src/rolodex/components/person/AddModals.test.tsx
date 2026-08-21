import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AddFactModal,
  AddGiftModal,
  AddNewsModal,
  AddReminderModal,
} from "./AddModals";
import AddDateModal from "./AddDateModal";
import AddConnectionModal from "./AddConnectionModal";
import { api } from "../../api";
import {
  fact,
  gift,
  importantDate,
  news,
  person,
  reminder,
} from "../../test/helpers";
import { withLocale } from "../../test/render";

vi.mock("../../api");

const onClose = vi.fn();
const onSaved = vi.fn().mockResolvedValue(undefined);
const maya = person({ id: 1, name: "Maya Chen" });

describe("adding news and facts", () => {
  it("will not save an empty note, and saves a trimmed one", async () => {
    vi.mocked(api.addNews).mockResolvedValue(news());
    render(
      withLocale(
        <AddNewsModal person={maya} onClose={onClose} onSaved={onSaved} />,
      ),
    );

    expect(screen.getByRole("button", { name: "Save news" })).toBeDisabled();
    await userEvent.type(
      screen.getByRole("textbox", { name: /What's new with them/ }),
      "  Moved to Berlin  ",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save news" }));
    expect(api.addNews).toHaveBeenCalledWith(1, "Moved to Berlin");
  });

  it("names the person it is about", () => {
    render(
      withLocale(
        <AddNewsModal person={maya} onClose={onClose} onSaved={onSaved} />,
      ),
    );
    expect(screen.getByText("Record news about Maya")).toBeInTheDocument();
  });

  it("saves a fact", async () => {
    vi.mocked(api.addFact).mockResolvedValue(fact());
    render(
      withLocale(
        <AddFactModal personId={1} onClose={onClose} onSaved={onSaved} />,
      ),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Fact" }),
      "Runs marathons",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save fact" }));
    expect(api.addFact).toHaveBeenCalledWith(1, "Runs marathons");
  });
});

describe("adding a reminder", () => {
  it("saves the text with the due date", async () => {
    vi.mocked(api.addReminder).mockResolvedValue(reminder());
    render(
      withLocale(
        <AddReminderModal personId={1} onClose={onClose} onSaved={onSaved} />,
      ),
    );

    await userEvent.type(
      screen.getByRole("textbox", { name: /What needs doing/ }),
      "Book a table",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Save reminder" }),
    );
    expect(api.addReminder).toHaveBeenCalledWith(
      1,
      "Book a table",
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
  });
});

describe("adding a gift", () => {
  it("saves what it is, what kind, and the occasion", async () => {
    vi.mocked(api.addGift).mockResolvedValue(gift());
    render(
      withLocale(
        <AddGiftModal personId={1} onClose={onClose} onSaved={onSaved} />,
      ),
    );

    await userEvent.type(
      screen.getByRole("textbox", { name: "What?" }),
      "Ceramic bowls",
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Kind" }),
      "given",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Occasion" }),
      "Birthday",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save gift" }));

    const [personId, body] = vi.mocked(api.addGift).mock.calls[0];
    expect(personId).toBe(1);
    expect(body).toMatchObject({
      name: "Ceramic bowls",
      kind: "given",
      occasion: "Birthday",
    });
    expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("adding an important date", () => {
  it("refuses a day and month it cannot make sense of", async () => {
    render(
      withLocale(
        <AddDateModal personId={1} onClose={onClose} onSaved={onSaved} />,
      ),
    );
    await userEvent.click(screen.getByRole("button", { name: "Save date" }));
    expect(
      screen.getByText("Please give a valid day and month"),
    ).toBeInTheDocument();
    expect(api.addDate).not.toHaveBeenCalled();
  });

  it("refuses a year from the wrong century", async () => {
    render(
      withLocale(
        <AddDateModal personId={1} onClose={onClose} onSaved={onSaved} />,
      ),
    );
    await userEvent.type(
      screen.getByRole("spinbutton", { name: "Day *" }),
      "15",
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Month *" }),
      "3",
    );
    await userEvent.type(
      screen.getByRole("spinbutton", { name: /Year/ }),
      "1200",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save date" }));
    expect(screen.getByText(/Year looks off/)).toBeInTheDocument();
  });

  it("saves a birthday", async () => {
    vi.mocked(api.addDate).mockResolvedValue(importantDate());
    render(
      withLocale(
        <AddDateModal personId={1} onClose={onClose} onSaved={onSaved} />,
      ),
    );

    await userEvent.type(
      screen.getByRole("spinbutton", { name: "Day *" }),
      "15",
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Month *" }),
      "3",
    );
    await userEvent.type(
      screen.getByRole("spinbutton", { name: /Year/ }),
      "1990",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save date" }));

    expect(api.addDate).toHaveBeenCalledWith(1, {
      type: "birthday",
      label: null,
      month: 3,
      day: 15,
      year: 1990,
    });
  });

  it("asks for a name when the date belongs to a child", async () => {
    render(
      withLocale(
        <AddDateModal personId={1} onClose={onClose} onSaved={onSaved} />,
      ),
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Type" }),
      "child_birthday",
    );
    expect(
      screen.getByRole("textbox", { name: /child's name/ }),
    ).toBeInTheDocument();
  });

  it("shows what the server refused", async () => {
    vi.mocked(api.addDate).mockRejectedValue(new Error("31/2 is not a date"));
    render(
      withLocale(
        <AddDateModal personId={1} onClose={onClose} onSaved={onSaved} />,
      ),
    );
    await userEvent.type(
      screen.getByRole("spinbutton", { name: "Day *" }),
      "31",
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Month *" }),
      "2",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save date" }));
    expect(await screen.findByText("31/2 is not a date")).toBeInTheDocument();
  });
});

describe("connecting two people", () => {
  const ben = person({ id: 2, name: "Ben Foster" });
  const renderConnect = () =>
    render(
      withLocale(
        <AddConnectionModal
          person={maya}
          people={[maya, ben]}
          onClose={onClose}
          onSaved={onSaved}
        />,
      ),
    );

  it("needs someone to connect to", async () => {
    renderConnect();
    await userEvent.click(
      screen.getByRole("button", { name: "Save connection" }),
    );
    expect(screen.getByText("Pick a person to connect")).toBeInTheDocument();
  });

  it("offers everyone except the person themselves", () => {
    renderConnect();
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toContain("Ben Foster");
    expect(options).not.toContain("Maya Chen");
  });

  it("saves a plain relationship", async () => {
    vi.mocked(api.addConnection).mockResolvedValue({});
    renderConnect();
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Person" }),
      "2",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Save connection" }),
    );
    expect(api.addConnection).toHaveBeenCalledWith(1, {
      other_id: 2,
      kind: "partner",
      a_is_parent: false,
      label: null,
      inverse_label: null,
      note: null,
    });
  });

  it("asks who the parent is, and records the answer", async () => {
    vi.mocked(api.addConnection).mockResolvedValue({});
    renderConnect();
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Person" }),
      "2",
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Relationship" }),
      "parent_child",
    );
    await userEvent.click(
      screen.getByRole("radio", { name: "Ben Foster is the parent" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Save connection" }),
    );
    expect(api.addConnection).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ kind: "parent_child", a_is_parent: false }),
    );
  });

  it("words a free-text connection from both sides", async () => {
    vi.mocked(api.addConnection).mockResolvedValue({});
    renderConnect();
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Person" }),
      "2",
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Relationship" }),
      "other",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "On Maya's page" }),
      "Introduced me to",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Save connection" }),
    );

    expect(api.addConnection).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        label: "Introduced me to Ben Foster",
        inverse_label: "Connected to Maya Chen",
      }),
    );
    await waitFor(() => {
      expect(onSaved).toHaveBeenCalled();
    });
  });
});
