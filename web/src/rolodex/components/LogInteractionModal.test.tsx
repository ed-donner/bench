import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogInteractionModal } from "./LogInteractionModal";
import { api } from "../api";
import { ToastContext } from "../store";
import { interaction, person } from "../test/helpers";
import { withLocale } from "../test/render";

vi.mock("../api");

const toast = vi.fn();
const maya = person({ id: 1, name: "Maya Chen" });

function renderLog() {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  render(
    withLocale(
      <ToastContext.Provider value={toast}>
        <LogInteractionModal
          person={maya}
          onClose={onClose}
          onSaved={onSaved}
        />
      </ToastContext.Provider>,
    ),
  );
  return { onClose, onSaved };
}

describe("logging an interaction", () => {
  it("offers every kind of contact, with call chosen to start with", () => {
    renderLog();
    for (const kind of ["Call", "Message", "Email", "Met up", "Other"])
      expect(screen.getByRole("button", { name: kind })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Call" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("saves the kind, the date and the notes, then says the clock is reset", async () => {
    vi.mocked(api.addInteraction).mockResolvedValue(interaction());
    const { onClose, onSaved } = renderLog();

    await userEvent.click(screen.getByRole("button", { name: "Met up" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: /What did you talk about/ }),
      "  Coffee near the office  ",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Save interaction" }),
    );

    expect(api.addInteraction).toHaveBeenCalledWith(
      1,
      "met",
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      "Coffee near the office",
    );
    await waitFor(() => {
      expect(onSaved).toHaveBeenCalled();
    });
    expect(onClose).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      "Logged a met up with Maya — the clock is reset",
    );
  });

  it("keeps the form open and shows why when the server refuses", async () => {
    vi.mocked(api.addInteraction).mockRejectedValue(
      new Error("A valid date (yyyy-mm-dd) is required"),
    );
    const { onClose } = renderLog();
    await userEvent.click(
      screen.getByRole("button", { name: "Save interaction" }),
    );
    expect(
      await screen.findByText("A valid date (yyyy-mm-dd) is required"),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const { onClose } = renderLog();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
