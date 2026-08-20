import type { MessageKey, TranslateFn } from "../shared/i18n";
import type { ActivityType, ContactStatus, DealStage } from "./types";

export function stageLabel(t: TranslateFn, stage: DealStage): string {
  return t(`crm.stage.${stage}` as MessageKey);
}

export function statusLabel(t: TranslateFn, status: ContactStatus): string {
  return t(`crm.status.${status}` as MessageKey);
}

export function activityTypeLabel(t: TranslateFn, type: ActivityType): string {
  return t(`crm.activityType.${type}` as MessageKey);
}
