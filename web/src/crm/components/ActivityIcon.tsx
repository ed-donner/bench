import { ActivityType } from "../types";
import { useT } from "../../shared/useLocale";
import { activityTypeLabel } from "../i18n";
import { IconCall, IconEmail, IconNote } from "./Icons";

const GLYPH = {
  note: IconNote,
  call: IconCall,
  email: IconEmail,
};

/** The round badge on an activity, in the timeline and in the dashboard feed. */
export default function ActivityIcon({ type }: { type: ActivityType }) {
  const t = useT("crm");
  const Glyph = GLYPH[type];
  return (
    <div className={`activity-icon ${type}`} title={activityTypeLabel(t, type)}>
      <Glyph size={15} />
    </div>
  );
}
