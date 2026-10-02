import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DealForm from "./DealForm";
import { api } from "../api";
import { renderCrm, contact, deal, org } from "../test/helpers";

vi.mock("../api", () => ({ api: { post: vi.fn(), put: vi.fn() } }));

const organizations = [
  org({ id: 1, name: "Bluepeak Software" }),
  org({ id: 2, name: "Alderway" }),
];
const contacts = [
  contact({ id: 1, name: "Dana Whitfield" }),
  contact({ id: 2, name: "Sam Reyes" }),
];

beforeEach(() => {
  vi.mocked(api.post).mockResolvedValue({});
  vi.mocked(api.put).mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllMocks();
});

function show(props: Partial<Parameters<typeof DealForm>[0]> = {}) {
  const onSaved = vi.fn();
  const onClose = vi.fn();
  renderCrm(
    <DealForm
      organizations={organizations}
      contacts={contacts}
      onSaved={onSaved}
      onClose={onClose}
      {...props}
    />,
  );
  return { onSaved, onClose };
}

const fill = async (label: string, value: string) => {
  const field = screen.getByLabelText(label);
  await userEvent.clear(field);
  await userEvent.type(field, value);
};

describe("DealForm", () => {
  it("opens a new deal at New, on that stage's default probability", () => {
    show();
    expect(
      screen.getByRole("dialog", { name: "Add deal" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Stage")).toHaveValue("New");
    expect(screen.getByLabelText("Probability (%)")).toHaveValue(10);
  });

  it("re-bases the probability when the stage changes", async () => {
    show();
    await userEvent.selectOptions(
      screen.getByLabelText("Stage"),
      "Negotiation",
    );
    expect(screen.getByLabelText("Probability (%)")).toHaveValue(75);
  });

  it("shows the expected value and keeps it in step with value and probability", async () => {
    show();
    await fill("Value (USD)", "40000");
    expect(screen.getByLabelText("Expected value")).toHaveTextContent("$4,000");

    await fill("Probability (%)", "25");
    expect(screen.getByLabelText("Expected value")).toHaveTextContent(
      "$10,000",
    );
  });

  it("posts a new deal, sending the unset relations as null", async () => {
    const { onSaved, onClose } = show();
    await fill("Name", "Platform rollout");
    await fill("Value (USD)", "40000");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(api.post).toHaveBeenCalledWith("/api/crm/deals", {
      name: "Platform rollout",
      organization_id: null,
      contact_id: null,
      stage: "New",
      value: 40000,
      probability: 10,
      close_date: null,
    });
    expect(onSaved).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("sends the chosen organization and contact as numbers", async () => {
    show();
    await fill("Name", "Platform rollout");
    await userEvent.selectOptions(
      screen.getByLabelText("Organization"),
      "Alderway",
    );
    await userEvent.selectOptions(
      screen.getByLabelText("Primary contact"),
      "Sam Reyes",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(api.post).toHaveBeenCalledWith(
      "/api/crm/deals",
      expect.objectContaining({ organization_id: 2, contact_id: 2 }),
    );
  });

  it("starts on the organization the page it was opened from belongs to", () => {
    show({ defaultOrganizationId: 2 });
    expect(screen.getByLabelText("Organization")).toHaveValue("2");
  });

  it("opens on the existing deal and puts to its id", async () => {
    show({ existing: deal({ id: 5, close_date: "2026-09-30" }) });
    expect(
      screen.getByRole("dialog", { name: "Edit deal" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Platform rollout");
    expect(screen.getByLabelText("Close date")).toHaveValue("2026-09-30");

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(api.put).toHaveBeenCalledWith(
      "/api/crm/deals/5",
      expect.objectContaining({
        stage: "Proposal",
        value: 40000,
        probability: 50,
        close_date: "2026-09-30",
      }),
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  it("keeps a probability an edit set by hand, rather than the stage default", () => {
    show({ existing: deal({ id: 5, stage: "Proposal", probability: 65 }) });
    expect(screen.getByLabelText("Probability (%)")).toHaveValue(65);
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
