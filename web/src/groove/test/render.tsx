import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { LocaleProvider } from "../../shared/LocaleContext";

function wrap(ui: ReactElement) {
  return <LocaleProvider>{ui}</LocaleProvider>;
}

export function renderGroove(ui: ReactElement, options?: RenderOptions) {
  const view = render(wrap(ui), options);
  return {
    ...view,
    rerender: (next: ReactElement) => view.rerender(wrap(next)),
  };
}
