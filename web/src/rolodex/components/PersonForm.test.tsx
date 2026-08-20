import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PersonForm } from "./PersonForm";
import { api } from "../api";
import { StoreContext, ToastContext } from "../store";
import { person, withLocale } from "../test/helpers";

vi.mock("../api");

const refresh = vi.fn().mockResolvedValue(undefined);
const toast = vi.fn();

function renderForm(props: Partial<Parameters<typeof PersonForm>[0]> = {}) {
  const onClose = vi.fn();
  render(
    withLocale(
      <StoreContext.Provider
        value={{ people: [], tags: [], loaded: true, refresh }}
      >
        <ToastContext.Provider value={toast}>
          <PersonForm onClose={onClose} {...props} />
        </ToastContext.Provider>
      </StoreContext.Provider>,
    ),
  );
  return { onClose };
}

describe("PersonForm", () => {
  it("refuses to save without a name", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Add person" }));
    expect(screen.getByText("A name is required")).toBeInTheDocument();
    expect(api.createPerson).not.toHaveBeenCalled();
  });

  it("creates a person from what was typed, trimming and splitting the tags", async () => {
    vi.mocked(api.createPerson).mockResolvedValue(
      person({ name: "Ada Lovelace" }),
    );
    const { onClose } = renderForm();

    await userEvent.type(
      screen.getByRole("textbox", { name: "Name *" }),
      "  Ada Lovelace  ",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Email" }),
      "ada@example.com",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Tags" }),
      "Maths, Computing",
    );
    await userEvent.click(screen.getByRole("button", { name: "Add person" }));

    expect(api.createPerson).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ada Lovelace",
        email: "ada@example.com",
        tags: ["maths", "computing"],
        circle: "close",
      }),
    );
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(toast).toHaveBeenCalledWith("Ada Lovelace added to Rolodex");
  });

  it("starts from the person it is editing and updates them", async () => {
    const existing = person({ id: 7, name: "Maya Chen", circle: "inner" });
    vi.mocked(api.updatePerson).mockResolvedValue(existing);
    renderForm({ existing });

    expect(screen.getByRole("textbox", { name: "Name *" })).toHaveValue(
      "Maya Chen",
    );
    expect(screen.getByRole("button", { name: "Inner" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await userEvent.click(screen.getByRole("button", { name: "Wider" }));
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(api.updatePerson).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ circle: "wider" }),
    );
  });

  it("turns check-ins off for someone you do not want nudging about", async () => {
    vi.mocked(api.createPerson).mockResolvedValue(person());
    renderForm();
    await userEvent.type(
      screen.getByRole("textbox", { name: "Name *" }),
      "Ada",
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: /Turn check-ins off/ }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Add person" }));
    expect(api.createPerson).toHaveBeenCalledWith(
      expect.objectContaining({ checkins_off: true }),
    );
  });

  it("shows what the server refused, rather than closing", async () => {
    vi.mocked(api.createPerson).mockRejectedValue(
      new Error("Name is required"),
    );
    const { onClose } = renderForm();
    await userEvent.type(
      screen.getByRole("textbox", { name: "Name *" }),
      "Ada",
    );
    await userEvent.click(screen.getByRole("button", { name: "Add person" }));
    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
