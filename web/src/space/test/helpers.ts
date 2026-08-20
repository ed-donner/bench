import { expect } from "vitest";
import { render, type RenderOptions } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { LocaleProvider } from "../../shared/LocaleProvider";
import type { Block, PageData, TreeNode } from "../api";
import { spaceEn } from "../i18n/en";
import { spaceHi } from "../i18n/hi";

export function node(partial: Partial<TreeNode> & { id: string }): TreeNode {
  return {
    parent_id: null,
    type: "page",
    title: partial.id,
    icon: null,
    position: 0,
    children: [],
    ...partial,
  };
}

export function pageData(
  partial: Partial<PageData> & { id: string },
): PageData {
  return {
    parent_id: null,
    type: "page",
    title: partial.id,
    icon: null,
    blocks: [],
    ...partial,
  };
}

export function block(partial: Partial<Block> & { id: string }): Block {
  return {
    page_id: "p1",
    type: "paragraph",
    content: { text: partial.id },
    position: 0,
    ...partial,
  };
}

/**
 * vitest's asymmetric matchers are typed `any`, which spreads through every object literal they
 * sit inside. These hand back `unknown`, which the matcher argument accepts just as happily.
 */
export function containing(shape: Record<string, unknown>): unknown {
  return expect.objectContaining(shape);
}

export function arrayContaining(items: unknown[]): unknown {
  return expect.arrayContaining(items);
}

function LocaleWrapper({ children }: { children: ReactNode }) {
  return createElement(LocaleProvider, {
    messages: { en: spaceEn, hi: spaceHi },
    children,
  });
}

export function renderSpace(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: LocaleWrapper, ...options });
}
