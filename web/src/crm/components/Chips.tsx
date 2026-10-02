import {
  ContactStatus,
  DealStage,
  contactStatusLabel,
  dealStageLabel,
} from "../types";
import { useLocale } from "../../shared/useLocale";

export function StatusChip({ status }: { status: ContactStatus }) {
  const { t } = useLocale();
  return (
    <span className={`chip chip-${status}`}>
      {contactStatusLabel(status, t)}
    </span>
  );
}

export function StageChip({ stage }: { stage: DealStage }) {
  const { t } = useLocale();
  return (
    <span className={`chip stage-${stage}`}>{dealStageLabel(stage, t)}</span>
  );
}
