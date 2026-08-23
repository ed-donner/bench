import { useT } from "../../shared/useLocale";

const EMOJIS = [
  "📄",
  "📝",
  "📚",
  "📖",
  "🗂️",
  "📁",
  "✅",
  "📌",
  "🎯",
  "🚀",
  "💡",
  "🧠",
  "🏠",
  "🗺️",
  "✈️",
  "🧳",
  "🗾",
  "🍜",
  "🍝",
  "🍳",
  "🥗",
  "☕",
  "🎨",
  "🎵",
  "🎮",
  "🏃",
  "💪",
  "🧘",
  "🌱",
  "🌞",
  "🌙",
  "⭐",
  "🔥",
  "❄️",
  "💧",
  "🌊",
  "🐛",
  "🔧",
  "🖥️",
  "📦",
  "🔑",
  "💰",
  "📊",
  "📈",
  "🗓️",
  "⏰",
  "✉️",
  "🎁",
  "❤️",
  "🎉",
];

interface Props {
  onPick: (emoji: string | null) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onPick, onClose }: Props) {
  const t = useT();
  return (
    <div
      role="presentation"
      className="menu-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="emoji-picker"
        role="dialog"
        aria-label={t("space.emoji.title")}
      >
        <div className="emoji-grid">
          {EMOJIS.map((e) => (
            <button
              key={e}
              className="emoji-cell"
              onClick={() => onPick(e)}
              aria-label={t("space.emoji.iconAria", { emoji: e })}
            >
              {e}
            </button>
          ))}
        </div>
        <button className="btn btn-subtle" onClick={() => onPick(null)}>
          {t("space.emoji.remove")}
        </button>
      </div>
    </div>
  );
}
