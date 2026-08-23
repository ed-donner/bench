import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { LocaleProvider } from "../LocaleProvider";

export function renderWithLocale(ui: ReactElement, options?: RenderOptions) {
  return render(<LocaleProvider>{ui}</LocaleProvider>, options);
}
