import { useTranslation } from "react-i18next";
import { ContactStatus, DealStage } from "../types";

/** The class keeps the stored value, which is what carries the colour; only the text is translated. */
export function StatusChip({ status }: { status: ContactStatus }) {
  const { t } = useTranslation("crm");
  return <span className={`chip chip-${status}`}>{t(`status.${status}`)}</span>;
}

export function StageChip({ stage }: { stage: DealStage }) {
  const { t } = useTranslation("crm");
  return <span className={`chip stage-${stage}`}>{t(`stage.${stage}`)}</span>;
}
