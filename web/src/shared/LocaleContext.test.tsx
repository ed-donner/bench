import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "./LocaleContext";
import { useT } from "./useLocale";
import { setLocale } from "./locale";

function SharedProbe() {
  const t = useT("shared");
  return <span data-testid="msg">{t("home")}</span>;
}

function CrmProbe() {
  const t = useT("crm");
  return <span data-testid="msg">{t("navDashboard")}</span>;
}

describe("LocaleContext", () => {
  it("returns Spanish strings when the locale is es", () => {
    setLocale("es");
    render(
      <LocaleProvider>
        <SharedProbe />
      </LocaleProvider>,
    );
    expect(screen.getByTestId("msg")).toHaveTextContent("Inicio");
  });

  it("returns English strings when the locale is en", () => {
    setLocale("en");
    render(
      <LocaleProvider>
        <CrmProbe />
      </LocaleProvider>,
    );
    expect(screen.getByTestId("msg")).toHaveTextContent("Dashboard");
  });
});
