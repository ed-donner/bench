import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useLocale } from "../../shared/useLocale";
import { api, type PersonDetail } from "../api";
import { errorMessage } from "../format";
import { useStore } from "../store";
import { PersonForm } from "../components/PersonForm";
import { LogInteractionModal } from "../components/LogInteractionModal";
import PersonHeader from "../components/person/PersonHeader";
import PersonMain from "../components/person/PersonMain";
import PersonSide from "../components/person/PersonSide";
import AddDateModal from "../components/person/AddDateModal";
import AddConnectionModal from "../components/person/AddConnectionModal";
import {
  AddFactModal,
  AddGiftModal,
  AddNewsModal,
  AddReminderModal,
} from "../components/person/AddModals";

type QuickModal =
  | "news"
  | "fact"
  | "date"
  | "reminder"
  | "gift"
  | "connection"
  | "log"
  | "edit"
  | null;

export default function PersonDetailPage() {
  const { t } = useLocale();
  const { id } = useParams();
  const personId = Number(id);
  const { people, refresh } = useStore();
  const [detail, setDetail] = useState<PersonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<QuickModal>(null);

  const load = useCallback(
    () =>
      api
        .getPerson(personId)
        .then(setDetail)
        .catch((e: unknown) => {
          setError(errorMessage(e));
        }),
    [personId],
  );

  useEffect(() => {
    let cancelled = false;
    void api
      .getPerson(personId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [personId]);

  const after = useCallback(async () => {
    await Promise.all([load(), refresh()]);
  }, [load, refresh]);

  if (error)
    return <div className="page">{t("person.loadError", { error })}</div>;
  if (!detail) return <div className="page muted">{t("person.loading")}</div>;

  const { person } = detail;
  return (
    <div className="page">
      <PersonHeader
        person={person}
        onLog={() => setModal("log")}
        onEdit={() => setModal("edit")}
      />

      <div className="person-layout">
        <PersonMain detail={detail} after={after} onAdd={setModal} />
        <PersonSide detail={detail} after={after} onAdd={setModal} />
      </div>

      {modal === "edit" && (
        <PersonForm
          existing={person}
          onClose={() => setModal(null)}
          onSaved={() => void load()}
        />
      )}
      {modal === "log" && (
        <LogInteractionModal
          person={person}
          onClose={() => setModal(null)}
          onSaved={() => void after()}
        />
      )}
      {modal === "news" && (
        <AddNewsModal
          person={person}
          onClose={() => setModal(null)}
          onSaved={after}
        />
      )}
      {modal === "fact" && (
        <AddFactModal
          personId={person.id}
          onClose={() => setModal(null)}
          onSaved={after}
        />
      )}
      {modal === "date" && (
        <AddDateModal
          personId={person.id}
          onClose={() => setModal(null)}
          onSaved={after}
        />
      )}
      {modal === "reminder" && (
        <AddReminderModal
          personId={person.id}
          onClose={() => setModal(null)}
          onSaved={after}
        />
      )}
      {modal === "gift" && (
        <AddGiftModal
          personId={person.id}
          onClose={() => setModal(null)}
          onSaved={after}
        />
      )}
      {modal === "connection" && (
        <AddConnectionModal
          person={person}
          people={people}
          onClose={() => setModal(null)}
          onSaved={after}
        />
      )}
    </div>
  );
}
