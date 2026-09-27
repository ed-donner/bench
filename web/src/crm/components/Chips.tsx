import { ContactStatus, DealStage } from "../types";
import { stageLabel, statusLabel } from "../strings";

export function StatusChip({ status }: { status: ContactStatus }) {
  return <span className={`chip chip-${status}`}>{statusLabel(status)}</span>;
}

export function StageChip({ stage }: { stage: DealStage }) {
  return <span className={`chip stage-${stage}`}>{stageLabel(stage)}</span>;
}
