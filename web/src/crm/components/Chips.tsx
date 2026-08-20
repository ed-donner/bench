import { ContactStatus, DealStage } from "../types";
import { useT } from "../../shared/useLocale";
import { contactStatusLabel, dealStageLabel } from "../i18n";

export function StatusChip({ status }: { status: ContactStatus }) {
  const t = useT("crm");
  return (
    <span className={`chip chip-${status}`}>
      {contactStatusLabel(t, status)}
    </span>
  );
}

export function StageChip({ stage }: { stage: DealStage }) {
  const t = useT("crm");
  return (
    <span className={`chip stage-${stage}`}>{dealStageLabel(t, stage)}</span>
  );
}
