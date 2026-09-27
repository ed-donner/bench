/** CRM's text, and the display names of its fixed vocabulary - the stored values stay the keys. */
import { makeT } from "../shared/i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";
import type { ActivityType, ContactStatus, DealStage } from "./types";

export const { t, useT } = makeT({ en, es });

export const stageLabel = (stage: DealStage) => t(`stage.${stage}`);

export const statusLabel = (status: ContactStatus) => t(`status.${status}`);

export const activityLabel = (type: ActivityType) => t(`activity.${type}`);
