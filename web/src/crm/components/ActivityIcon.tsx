import { ActivityType } from "../types";
import { IconCall, IconEmail, IconNote } from "./Icons";
import { useTranslation } from "react-i18next";

const GLYPH = {
  note: IconNote,
  call: IconCall,
  email: IconEmail,
};

/** The round badge on an activity, in the timeline and in the dashboard feed. */
export default function ActivityIcon({ type }: { type: ActivityType }) {
  const { t } = useTranslation("crm");
  const Glyph = GLYPH[type];
  return (
    <div className={`activity-icon ${type}`} title={t(`activityType.${type}`)}>
      <Glyph size={15} />
    </div>
  );
}
