import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrganizationForm from "./OrganizationForm";
import { api } from "../api";
import { renderCrm, org } from "../test/helpers";

vi.mock("../api", () => ({ api: { post: vi.fn(), put: vi.fn() } }));

beforeEach(() => {
  vi.mocked(api.post).mockResolvedValue({});
  vi.mocked(api.put).mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllMocks();
});

function show(existing?: ReturnType<typeof org>) {
  const onSaved = vi.fn();
  const onClose = vi.fn();
  renderCrm(
    <OrganizationForm
      existing={existing}
      onSaved={onSaved}
      onClose={onClose}
    />,
  );
  return { onSaved, onClose };
}

describe("OrganizationForm", () => {
  it("opens blank to add a new organization", () => {
    show();
    expect(
      screen.getByRole("dialog", { name: "Add organization" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("posts what was typed, then reports saved and closes", async () => {
    const { onSaved, onClose } = show();
    await userEvent.type(screen.getByLabelText("Name"), "Alderway");
    await userEvent.type(screen.getByLabelText("Website"), "alderway.test");
    await userEvent.type(screen.getByLabelText("Industry"), "Logistics");
    await userEvent.type(screen.getByLabelText("Notes"), "Met at the expo");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(api.post).toHaveBeenCalledWith("/api/crm/organizations", {
      name: "Alderway",
      website: "alderway.test",
      industry: "Logistics",
      notes: "Met at the expo",
    });
    expect(onSaved).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("opens on the existing values and puts to its id", async () => {
    show(org({ id: 4, name: "Bluepeak Software", notes: null }));
    expect(
      screen.getByRole("dialog", { name: "Edit organization" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Bluepeak Software");
    expect(screen.getByLabelText("Notes")).toHaveValue("");

    await userEvent.type(screen.getByLabelText("Name"), " Ltd");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(api.put).toHaveBeenCalledWith(
      "/api/crm/organizations/4",
      expect.objectContaining({ name: "Bluepeak Software Ltd" }),
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  it("will not submit without a name", async () => {
    show();
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(api.post).not.toHaveBeenCalled();
  });

  it("closes without saving on Cancel", async () => {
    const { onSaved, onClose } = show();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSaved).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });
});
