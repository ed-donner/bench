import { createElement, type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { LocaleProvider } from "../../shared/LocaleProvider";
import type { Activity, Contact, Deal, Organization } from "../types";
import { crmMessages } from "../i18n";

/** Fixture builders. Every field has a default, so a test names only what it is about. */

export function renderCrm(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(LocaleProvider, { messages: crmMessages, children }),
    ...options,
  });
}

/**
 * Stands in for `api.get` across the several endpoints a page loads. Longest path first, so
 * `/api/crm/deals/1` never answers from the `/api/crm/deals` entry.
 */
export function routes(map: Record<string, unknown>) {
  const paths = Object.keys(map).sort((a, b) => b.length - a.length);
  return (url: string) => {
    const path = paths.find((p) => url.startsWith(p));
    if (!path) throw new Error(`No fixture for ${url}`);
    return Promise.resolve(map[path]);
  };
}

export function org(partial: Partial<Organization> = {}): Organization {
  return {
    id: 1,
    name: "Bluepeak Software",
    website: "bluepeak.example.com",
    industry: "Software",
    notes: null,
    created_at: "2026-01-04 09:00:00",
    ...partial,
  };
}

export function contact(partial: Partial<Contact> = {}): Contact {
  return {
    id: 1,
    name: "Dana Whitfield",
    email: "dana@example.com",
    phone: "555-0142",
    job_title: "Head of Ops",
    organization_id: 1,
    status: "lead",
    created_at: "2026-01-04 09:00:00",
    ...partial,
  };
}

export function deal(partial: Partial<Deal> = {}): Deal {
  return {
    id: 1,
    name: "Platform rollout",
    organization_id: 1,
    contact_id: 1,
    stage: "Proposal",
    value: 40000,
    probability: 50,
    close_date: "2026-09-30",
    board_order: 0,
    created_at: "2026-01-04 09:00:00",
    ...partial,
  };
}

export function activity(partial: Partial<Activity> = {}): Activity {
  return {
    id: 1,
    type: "note",
    contact_id: 1,
    deal_id: null,
    description: "Kicked off the pilot",
    occurred_at: "2026-06-02 14:30:00",
    due_date: null,
    done: 0,
    created_at: "2026-06-02 14:30:00",
    ...partial,
  };
}
