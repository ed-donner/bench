import { useT } from "../../shared/useLocale";
import { statusLabel, stageLabel } from "../labels";
import { ContactStatus, DealStage } from "../types";

export function StatusChip({ status }: { status: ContactStatus }) {
  const t = useT();
  return (
    <span className={`chip chip-${status}`}>{statusLabel(t, status)}</span>
  );
}

export function StageChip({ stage }: { stage: DealStage }) {
  const t = useT();
  return <span className={`chip stage-${stage}`}>{stageLabel(t, stage)}</span>;
}
