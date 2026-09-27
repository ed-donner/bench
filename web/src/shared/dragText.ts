/**
 * What dnd-kit tells a screen reader, in the page's language. Its defaults are English and name
 * items by id - a uuid here - so every board passes these instead.
 */
import type { Announcements, ScreenReaderInstructions } from "@dnd-kit/core";
import { useT } from "./strings";

export function useDragText(): {
  announcements: Announcements;
  screenReaderInstructions: ScreenReaderInstructions;
} {
  const t = useT();
  return {
    screenReaderInstructions: { draggable: t("drag.instructions") },
    announcements: {
      onDragStart: () => t("drag.picked"),
      onDragOver: ({ over }) => (over ? t("drag.over") : t("drag.outside")),
      onDragEnd: ({ over }) => (over ? t("drag.dropped") : t("drag.outside")),
      onDragCancel: () => t("drag.cancelled"),
    },
  };
}
