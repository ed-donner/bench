import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "./ContactForm";
import { api } from "../api";
import { contact, org, renderCrm } from "../test/helpers";

vi.mock("../api", () => ({ api: { post: vi.fn(), put: vi.fn() } }));

const organizations = [
  org({ id: 1, name: "Bluepeak Software" }),
  org({ id: 2, name: "Alderway" }),
];

beforeEach(() => {
  vi.mocked(api.post).mockResolvedValue({});
  vi.mocked(api.put).mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllMocks();
});

function show(props: Partial<Parameters<typeof ContactForm>[0]> = {}) {
  const onSaved = vi.fn();
  const onClose = vi.fn();
  renderCrm(
    <ContactForm
      organizations={organizations}
      onSaved={onSaved}
      onClose={onClose}
      {...props}
    />,
  );
  return { onSaved, onClose };
}

describe("ContactForm", () => {
  it("opens blank as a lead with no organization", () => {
    show();
    expect(
      screen.getByRole("dialog", { name: "Add contact" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toHaveValue("lead");
    expect(screen.getByLabelText("Organization")).toHaveValue("");
  });

  it("posts what was typed, sending no organization as null", async () => {
    const { onSaved, onClose } = show();
    await userEvent.type(screen.getByLabelText("Name"), "Sam Reyes");
    await userEvent.type(screen.getByLabelText("Email"), "sam@example.com");
    await userEvent.type(screen.getByLabelText("Phone"), "555-0188");
    await userEvent.type(screen.getByLabelText("Job title"), "Buyer");
    await userEvent.selectOptions(screen.getByLabelText("Status"), "qualified");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(api.post).toHaveBeenCalledWith("/api/crm/contacts", {
      name: "Sam Reyes",
      email: "sam@example.com",
      phone: "555-0188",
      job_title: "Buyer",
      organization_id: null,
      status: "qualified",
    });
    expect(onSaved).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("sends the chosen organization as a number, not the select's string", async () => {
    show();
    await userEvent.type(screen.getByLabelText("Name"), "Sam Reyes");
    await userEvent.selectOptions(
      screen.getByLabelText("Organization"),
      "Alderway",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(api.post).toHaveBeenCalledWith(
      "/api/crm/contacts",
      expect.objectContaining({ organization_id: 2 }),
    );
  });

  it("starts on the organization the page it was opened from belongs to", () => {
    show({ defaultOrganizationId: 2 });
    expect(screen.getByLabelText("Organization")).toHaveValue("2");
  });

  it("opens on the existing contact and puts to its id", async () => {
    show({ existing: contact({ id: 7, name: "Dana Whitfield" }) });
    expect(
      screen.getByRole("dialog", { name: "Edit contact" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Dana Whitfield");

    await userEvent.selectOptions(screen.getByLabelText("Organization"), "");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(api.put).toHaveBeenCalledWith(
      "/api/crm/contacts/7",
      expect.objectContaining({ organization_id: null }),
    );
  });

  it("will not submit without a name", async () => {
    show();
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
