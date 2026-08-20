import type { MessageKey } from "../shared/locales/en";
import type { ActivityType, ContactStatus, DealStage } from "./types";

export type CrmT = (key: MessageKey<"crm">) => string;

const STAGE_KEYS: Record<DealStage, MessageKey<"crm">> = {
  New: "stageNew",
  Qualified: "stageQualified",
  Proposal: "stageProposal",
  Negotiation: "stageNegotiation",
  Won: "stageWon",
  Lost: "stageLost",
};

const STATUS_KEYS: Record<ContactStatus, MessageKey<"crm">> = {
  lead: "statusLead",
  qualified: "statusQualified",
  customer: "statusCustomer",
};

const ACTIVITY_KEYS: Record<ActivityType, MessageKey<"crm">> = {
  note: "activityNote",
  call: "activityCall",
  email: "activityEmail",
};

export function dealStageLabel(t: CrmT, stage: DealStage): string {
  return t(STAGE_KEYS[stage]);
}

export function contactStatusLabel(t: CrmT, status: ContactStatus): string {
  return t(STATUS_KEYS[status]);
}

export function activityTypeLabel(t: CrmT, type: ActivityType): string {
  return t(ACTIVITY_KEYS[type]);
}
