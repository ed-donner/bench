import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ImportModal } from "./ImportModal";
import { api, type ImportRow } from "../api";
import { StoreContext, ToastContext } from "../store";
import { withLocale } from "../test/helpers";

vi.mock("../api");

const row = (
  partial: Partial<ImportRow["person"]> = {},
  duplicate = false,
): ImportRow => ({
  index: 0,
  person: {
    name: "Nora Feldman",
    email: "nora@example.com",
    phone: null,
    job_title: null,
    company: "Feldman Studio",
    city: "Berlin",
    birthday: null,
    notes: null,
    ...partial,
  },
  duplicate: {
    isDuplicate: duplicate,
    duplicateOfId: duplicate ? 4 : null,
    duplicateOfName: duplicate ? "Nora Feldman" : null,
    reason: duplicate ? "email" : null,
  },
});

const refresh = vi.fn().mockResolvedValue(undefined);

function renderImport() {
  const onClose = vi.fn();
  render(
    withLocale(
      <MemoryRouter>
        <StoreContext.Provider
          value={{ people: [], tags: [], loaded: true, refresh }}
        >
          <ToastContext.Provider value={vi.fn()}>
            <ImportModal onClose={onClose} />
          </ToastContext.Provider>
        </StoreContext.Provider>
      </MemoryRouter>,
    ),
  );
  return { onClose };
}

const chooseFile = async (name: string, text: string) => {
  const file = new File([text], name, { type: "text/csv" });
  await userEvent.upload(screen.getByLabelText("File to import"), file);
};

describe("importing people", () => {
  it("explains what will happen before a file is chosen", () => {
    renderImport();
    expect(
      screen.getByText(/Bring in contacts from a CSV/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Choose a .csv or .vcf file/ }),
    ).toBeInTheDocument();
  });

  it("previews the parsed rows and flags the likely duplicates", async () => {
    vi.mocked(api.importParse).mockResolvedValue({
      format: "csv",
      headers: ["Name", "Email"],
      raw_rows: [{ Name: "Nora Feldman", Email: "nora@example.com" }],
      suggested_mapping: { Name: "name", Email: "email" },
      rows: [row(), { ...row({ name: "Owen Clarke" }, true), index: 1 }],
      skipped: 0,
    });
    renderImport();
    await chooseFile("contacts.csv", "Name,Email\nNora,nora@example.com");

    expect(await screen.findByText("contacts.csv")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Import Nora Feldman" }),
    ).toBeChecked();
    expect(screen.getByText(/1 likely duplicate/)).toBeInTheDocument();
    // The duplicate is not selected, so the button offers to import the other one.
    expect(
      screen.getByRole("button", { name: "Import 1 person" }),
    ).toBeInTheDocument();
  });

  it("re-reads the file when a column is mapped by hand", async () => {
    vi.mocked(api.importParse).mockResolvedValue({
      format: "csv",
      headers: ["Name", "Works at"],
      raw_rows: [{ Name: "Nora Feldman", "Works at": "Feldman Studio" }],
      suggested_mapping: { Name: "name" },
      rows: [row({ company: null })],
      skipped: 0,
    });
    vi.mocked(api.importRemap).mockResolvedValue({ rows: [row()] });
    renderImport();
    await chooseFile("contacts.csv", "Name,Works at\nNora,Feldman Studio");
    await screen.findByText("Map the columns");

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Company" }),
      "Works at",
    );
    expect(api.importRemap).toHaveBeenCalledWith(
      ["Name", "Works at"],
      [{ Name: "Nora Feldman", "Works at": "Feldman Studio" }],
      expect.objectContaining({ "Works at": "company" }),
    );
  });

  it("imports the chosen people and reports what happened", async () => {
    vi.mocked(api.importParse).mockResolvedValue({
      format: "vcf",
      rows: [row()],
    });
    vi.mocked(api.importApply).mockResolvedValue({
      created: [{ id: 9, name: "Nora Feldman" }],
      skipped: 2,
    });
    renderImport();
    await chooseFile("contacts.vcf", "BEGIN:VCARD\nEND:VCARD");

    await userEvent.click(
      await screen.findByRole("button", { name: "Import 1 person" }),
    );
    expect(api.importApply).toHaveBeenCalledWith([row().person]);
    expect(await screen.findByText(/Imported 1 person/)).toBeInTheDocument();
    expect(screen.getByText(/2 duplicates skipped/)).toBeInTheDocument();
    await waitFor(() => {
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("shows what went wrong when the file cannot be read", async () => {
    vi.mocked(api.importParse).mockRejectedValue(
      new Error("A file is required"),
    );
    renderImport();
    await chooseFile("empty.csv", "");
    expect(await screen.findByText("A file is required")).toBeInTheDocument();
  });
});

describe("the preview table", () => {
  it("will not import someone who is already there", async () => {
    vi.mocked(api.importParse).mockResolvedValue({
      format: "csv",
      headers: ["Name"],
      raw_rows: [{ Name: "Nora Feldman" }],
      suggested_mapping: { Name: "name" },
      rows: [row({}, true)],
      skipped: 0,
    });
    renderImport();
    await chooseFile("contacts.csv", "Name\nNora");

    const tick = await screen.findByRole("checkbox", {
      name: "Import Nora Feldman",
    });
    expect(tick).toBeDisabled();
    expect(tick).not.toBeChecked();
    expect(
      screen.getByRole("button", { name: /Import 0 people/ }),
    ).toBeDisabled();
  });
});
