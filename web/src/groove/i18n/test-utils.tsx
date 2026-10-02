import { createElement, type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { LocaleProvider } from "../../shared/LocaleProvider";
import { grooveMessages } from "./index";

export function renderWithLocale(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(LocaleProvider, { messages: grooveMessages, children }),
    ...options,
  });
}

/** Match English or Hindi labels in role queries. */
export const unitRegion = (name: string) =>
  new RegExp(`^(${name}|${HI_UNITS[name] ?? name})$`, "i");

const HI_UNITS: Record<string, string> = {
  RHYTHM: "ताल",
  BASS: "बास",
  PADS: "पैड",
  LEAD: "लीड",
};

export const playStop = /PLAY|STOP|चलाएँ|रोकें/;
export const muteBtn = /MUTE|म्यूट/;
export const savedRevert = /SAVED|REVERT|सहेजा|पुनर्स्थापित/;
export const drumStep = (lane: string, step: number) =>
  new RegExp(`^${lane} (step|स्टेप) ${step}$`, "i");
export const melodicStep = (unit: string, step: number) =>
  new RegExp(`^${unit} (step|स्टेप) ${step}$`, "i");
