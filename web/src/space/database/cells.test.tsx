import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Cell, { Chip } from "./cells";
import { nextColor, OPTION_COLORS } from "./optionColors";
import type { Property, PropertyOption } from "../api";
import { renderSpace } from "../test/helpers";

const option = (id: string, name: string, color = "blue"): PropertyOption => ({
  id,
  name,
  color,
  position: 0,
});

const prop = (
  type: Property["type"],
  options: PropertyOption[] = [],
): Property => ({
  id: "prop1",
  name: "Field",
  type,
  position: 0,
  options,
});

function renderCell(
  p: Property,
  value: unknown,
  onChange = vi.fn(),
  onCreateOption = vi.fn(),
) {
  renderSpace(
    <Cell
      property={p}
      value={value}
      rowLabel="Row"
      onChange={onChange}
      onCreateOption={onCreateOption}
    />,
  );
  return { onChange, onCreateOption };
}

describe("nextColor", () => {
  it("cycles through the palette", () => {
    expect(nextColor([])).toBe(OPTION_COLORS[0]);
    expect(nextColor([option("a", "A")])).toBe(OPTION_COLORS[1]);
    expect(
      nextColor(
        Array.from({ length: 10 }, (_, i) => option(String(i), String(i))),
      ),
    ).toBe(OPTION_COLORS[0]);
  });
});

describe("text-like cells", () => {
  it("saves text on blur and clears to null", async () => {
    const { onChange } = renderCell(prop("text"), "old");
    const input = screen.getByRole("textbox", { name: "Field for Row" });
    await userEvent.clear(input);
    await userEvent.type(input, "new words");
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith("new words");

    await userEvent.clear(input);
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("commits on Enter", async () => {
    const { onChange } = renderCell(prop("text"), "");
    await userEvent.type(screen.getByRole("textbox"), "hi{Enter}");
    expect(onChange).toHaveBeenCalledWith("hi");
  });

  it("parses numbers and rejects junk", async () => {
    const { onChange } = renderCell(prop("number"), 4);
    const input = screen.getByRole("textbox", { name: "Field for Row" });
    await userEvent.clear(input);
    await userEvent.type(input, "12.5");
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(12.5);

    await userEvent.clear(input);
    await userEvent.type(input, "not a number");
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("shows an external link for url values", () => {
    renderCell(prop("url"), "example.com");
    expect(
      screen.getByRole("link", { name: "Open link example.com" }),
    ).toHaveAttribute("href", "https://example.com");
  });
});

describe("date and checkbox cells", () => {
  it("saves a picked date and clears it", () => {
    const onChange = vi.fn();
    renderSpace(
      <Cell
        property={prop("date")}
        value="2026-01-01"
        rowLabel="Row"
        onChange={onChange}
      />,
    );
    const input = screen.getByLabelText<HTMLInputElement>("Field for Row");
    expect(input.value).toBe("2026-01-01");
  });

  it("toggles a checkbox", async () => {
    const { onChange } = renderCell(prop("checkbox"), false);
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Field for Row" }),
    );
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("select cell", () => {
  const options = [
    option("o1", "Reading", "blue"),
    option("o2", "Finished", "green"),
  ];

  it("shows the chosen chip and picks another option", async () => {
    const { onChange } = renderCell(prop("select", options), "o1");
    expect(screen.getByText("Reading")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Field for Row" }),
    );
    await userEvent.click(screen.getByRole("button", { name: /Finished/ }));
    expect(onChange).toHaveBeenCalledWith("o2");
  });

  it("clears when re-picking the current option", async () => {
    const { onChange } = renderCell(prop("select", options), "o1");
    await userEvent.click(
      screen.getByRole("button", { name: "Field for Row" }),
    );
    const picker = screen.getByRole("dialog");
    await userEvent.click(within(picker).getByText("Reading"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("creates a new option from the search box", async () => {
    const created = option("o3", "Abandoned", "red");
    const onCreateOption = vi.fn().mockResolvedValue(created);
    const onChange = vi.fn();
    renderSpace(
      <Cell
        property={prop("select", options)}
        value={null}
        rowLabel="Row"
        onChange={onChange}
        onCreateOption={onCreateOption}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Field for Row" }),
    );
    await userEvent.type(
      screen.getByPlaceholderText("Select or create…"),
      "Abandoned",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Create “Abandoned”/ }),
    );
    expect(onCreateOption).toHaveBeenCalledWith("Abandoned");
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith("o3"));
  });

  it("filters options as you type", async () => {
    renderCell(prop("select", options), null);
    await userEvent.click(
      screen.getByRole("button", { name: "Field for Row" }),
    );
    await userEvent.type(
      screen.getByPlaceholderText("Select or create…"),
      "fin",
    );
    expect(screen.queryByText("Reading")).not.toBeInTheDocument();
    expect(screen.getByText("Finished")).toBeInTheDocument();
  });
});

describe("multi-select cell", () => {
  const options = [
    option("a", "Food", "amber"),
    option("b", "Hiking", "green"),
  ];

  it("toggles options on and off", async () => {
    const { onChange } = renderCell(prop("multi_select", options), ["a"]);
    await userEvent.click(
      screen.getByRole("button", { name: "Field for Row" }),
    );
    await userEvent.click(screen.getByRole("button", { name: /Hiking/ }));
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
  });

  it("removes a selected option when clicked again", async () => {
    const { onChange } = renderCell(prop("multi_select", options), ["a", "b"]);
    await userEvent.click(
      screen.getByRole("button", { name: "Field for Row" }),
    );
    const picker = screen.getByRole("dialog");
    await userEvent.click(within(picker).getByText("Food"));
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });
});

describe("Chip", () => {
  it("renders the color class and remove control", async () => {
    const onRemove = vi.fn();
    renderSpace(
      <Chip option={option("x", "Tag", "purple")} onRemove={onRemove} />,
    );
    expect(screen.getByText("Tag").className).toContain("chip-purple");
    await userEvent.click(screen.getByRole("button", { name: "Remove Tag" }));
    expect(onRemove).toHaveBeenCalled();
  });
});
