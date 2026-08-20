import {
  BadgeCheck,
  Megaphone,
  Plus,
  Sparkles,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useLocale } from "../../../shared/useLocale";
import { api, type PersonDetail } from "../../api";
import { EmptyState } from "../Modal";
import InteractionIcon from "../InteractionIcon";
import { fmtDate, interactionMeta, relativeDays } from "../../format";

interface TimelineItem {
  key: string;
  kind: "interaction" | "news" | "reminder_done";
  date: string;
  icon: React.ReactNode;
  label: string;
  text: string;
  interactionId?: number;
}

function personTimeline(
  t: ReturnType<typeof useLocale>["t"],
  detail: PersonDetail,
): TimelineItem[] {
  const items: TimelineItem[] = [
    ...detail.interactions.map((i) => ({
      key: `i-${i.id}`,
      kind: "interaction" as const,
      date: i.date,
      icon: <InteractionIcon type={i.type} />,
      label: interactionMeta(t, i.type).verb,
      text: i.notes ?? "",
      interactionId: i.id,
    })),
    ...detail.news.map((n) => ({
      key: `n-${n.id}`,
      kind: "news" as const,
      date: n.date,
      icon: <Megaphone size={15} />,
      label: t("person.newsLabel"),
      text: n.text,
    })),
    ...detail.reminders
      .filter((r) => r.done)
      .map((r) => ({
        key: `r-${r.id}`,
        kind: "reminder_done" as const,
        date: r.done_at?.slice(0, 10) ?? r.due_date,
        icon: <BadgeCheck size={15} />,
        label: t("person.reminderDoneLabel"),
        text: r.text,
      })),
  ];
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export default function PersonMain({
  detail,
  after,
  onAdd,
}: {
  detail: PersonDetail;
  after: () => Promise<void>;
  onAdd: (what: "fact" | "news") => void;
}) {
  const { t } = useLocale();
  const firstName = detail.person.name.split(" ")[0];
  const timeline = personTimeline(t, detail);

  return (
    <div className="person-col">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <StickyNote size={16} /> {t("person.timelineTitle")}
          </h2>
          <span className="card-sub">
            {t("person.timelineSub", { name: firstName })}
          </span>
        </div>
        {timeline.length === 0 ? (
          <EmptyState icon={<StickyNote />}>
            {t("person.timelineEmpty")}
          </EmptyState>
        ) : (
          <div className="feed">
            {timeline.map((item) => (
              <div key={item.key} className="feed-item">
                <div className={`feed-icon kind-${item.kind}`}>{item.icon}</div>
                <div className="feed-body">
                  <div className="feed-top">
                    <span className="feed-type">{item.label}</span>
                    <span className="feed-date">
                      {fmtDate(item.date)} · {relativeDays(t, item.date)}
                    </span>
                  </div>
                  {item.text && <div className="feed-text">{item.text}</div>}
                </div>
                {item.interactionId != null && (
                  <button
                    className="icon-btn danger"
                    title={t("person.deleteInteraction")}
                    aria-label={t("person.deleteInteraction")}
                    onClick={() => {
                      void api
                        .deleteInteraction(item.interactionId!)
                        .then(after);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Sparkles size={16} /> {t("person.factsTitle")}
          </h2>
          <button className="btn btn-sm" onClick={() => onAdd("fact")}>
            <Plus size={13} /> {t("person.addFact")}
          </button>
        </div>
        {detail.facts.length === 0 ? (
          <EmptyState icon={<Sparkles />}>{t("person.factsEmpty")}</EmptyState>
        ) : (
          <div className="card-body">
            {detail.facts.map((f) => (
              <div key={f.id} className="fact-row row">
                <Sparkles size={13} />
                <span className="grow">{f.text}</span>
                <button
                  className="icon-btn danger"
                  aria-label={t("person.deleteFact", { text: f.text })}
                  onClick={() => {
                    void api.deleteFact(f.id).then(after);
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Megaphone size={16} /> {t("person.newsTitle")}
          </h2>
          <button className="btn btn-sm" onClick={() => onAdd("news")}>
            <Plus size={13} /> {t("person.addNews")}
          </button>
        </div>
        {detail.news.length === 0 ? (
          <EmptyState icon={<Megaphone />}>{t("person.newsEmpty")}</EmptyState>
        ) : (
          <div className="feed">
            {detail.news.map((n) => (
              <div key={n.id} className="feed-item">
                <div className="feed-icon kind-news">
                  <Megaphone size={15} />
                </div>
                <div className="feed-body">
                  <div className="feed-text strong">{n.text}</div>
                  <div className="feed-date">{fmtDate(n.date)}</div>
                </div>
                <button
                  className="icon-btn danger"
                  aria-label={t("person.deleteNews")}
                  onClick={() => {
                    void api.deleteNews(n.id).then(after);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
