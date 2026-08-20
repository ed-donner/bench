import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActivityForm from "./ActivityForm";
import { api } from "../api";
import { renderCrm } from "../test/helpers";

vi.mock("../api", () => ({ api: { post: vi.fn() } }));

beforeEach(() => {
  vi.mocked(api.post).mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllMocks();
});

function show(props: Partial<Parameters<typeof ActivityForm>[0]> = {}) {
  const onSaved = vi.fn();
  const onClose = vi.fn();
  renderCrm(<ActivityForm onSaved={onSaved} onClose={onClose} {...props} />);
  return { onSaved, onClose };
}

const description = () => screen.getByLabelText("Description");

describe("ActivityForm", () => {
  it("opens as a note with no follow-up", () => {
    show();
    expect(
      screen.getByRole("dialog", { name: "Log activity" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toHaveValue("note");
  });

  it("logs against the contact it was opened from", async () => {
    const { onSaved, onClose } = show({ contactId: 3 });
    await userEvent.selectOptions(screen.getByLabelText("Type"), "call");
    await userEvent.type(description(), "Discovery call");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(api.post).toHaveBeenCalledWith("/api/crm/activities", {
      type: "call",
      description: "Discovery call",
      contact_id: 3,
      deal_id: null,
      due_date: null,
    });
    expect(onSaved).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("logs against the deal it was opened from, with a follow-up date", async () => {
    show({ dealId: 9 });
    await userEvent.type(description(), "Sent the proposal");
    await userEvent.type(
      screen.getByLabelText("Follow-up due date (optional)"),
      "2026-09-30",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(api.post).toHaveBeenCalledWith("/api/crm/activities", {
      type: "note",
      description: "Sent the proposal",
      contact_id: null,
      deal_id: 9,
      due_date: "2026-09-30",
    });
  });

  it("will not submit without a description", async () => {
    show({ contactId: 1 });
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(api.post).not.toHaveBeenCalled();
  });

  it("closes without saving on Cancel", async () => {
    const { onClose } = show();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(api.post).not.toHaveBeenCalled();
  });
});
