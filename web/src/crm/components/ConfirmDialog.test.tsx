import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "./ConfirmDialog";
import { renderCrm } from "../test/helpers";

function show() {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  renderCrm(
    <ConfirmDialog
      title="Delete contact"
      message="Delete Dana Whitfield?"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { onConfirm, onCancel };
}

describe("ConfirmDialog", () => {
  it("asks with the title and the message", () => {
    show();
    expect(
      screen.getByRole("dialog", { name: "Delete contact" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Delete Dana Whitfield?")).toBeInTheDocument();
  });

  it("confirms on Delete and cancels on Cancel", async () => {
    const { onConfirm, onCancel } = show();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
