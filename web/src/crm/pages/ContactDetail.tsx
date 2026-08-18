import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../api";
import { useFetch } from "../hooks";
import { Activity, Contact, Deal, Organization } from "../types";
import ContactForm from "../components/ContactForm";
import ConfirmDialog from "../components/ConfirmDialog";
import ActivityForm from "../components/ActivityForm";
import ActivityTimeline from "../components/ActivityTimeline";
import { StatusChip } from "../components/Chips";
import { DealList } from "../components/RelatedLists";
import PageHeader from "../components/PageHeader";
import { IconContacts } from "../components/Icons";
import { useTranslation } from "react-i18next";

function ContactFacts({
  contact,
  org,
}: {
  contact: Contact;
  org?: Organization;
}) {
  const { t } = useTranslation("crm");
  return (
    <dl className="props">
      <dt>{t("field.status")}</dt>
      <dd>
        <StatusChip status={contact.status} />
      </dd>
      <dt>{t("field.email")}</dt>
      <dd>{contact.email || "—"}</dd>
      <dt>{t("field.phone")}</dt>
      <dd>{contact.phone || "—"}</dd>
      <dt>{t("field.jobTitle")}</dt>
      <dd>{contact.job_title || "—"}</dd>
      <dt>{t("field.organization")}</dt>
      <dd>
        {org ? (
          <Link className="entity-link" to={`/organizations/${org.id}`}>
            {org.name}
          </Link>
        ) : (
          "—"
        )}
      </dd>
    </dl>
  );
}

export default function ContactDetail() {
  const { t } = useTranslation("crm");
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logging, setLogging] = useState(false);
  const { data: contact, reload } = useFetch<Contact>(
    `/api/crm/contacts/${id}`,
  );
  const { data: orgs } = useFetch<Organization[]>("/api/crm/organizations");
  const { data: deals } = useFetch<Deal[]>(`/api/crm/deals?contact_id=${id}`);
  const { data: activities, reload: reloadActivities } = useFetch<Activity[]>(
    `/api/crm/activities?contact_id=${id}`,
  );
  const org = orgs?.find((o) => o.id === contact?.organization_id);
  const atOrg = org ? ` at ${org.name}` : "";

  if (!contact) return null;

  async function remove() {
    await api.delete(`/api/crm/contacts/${id}`);
    void navigate("/contacts");
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/contacts">{t("contacts.title")}</Link> / {contact.name}
      </div>
      <PageHeader
        icon={<IconContacts size={20} />}
        title={contact.name}
        sub={(contact.job_title || t("empty.contactFallback")) + atOrg}
      >
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setLogging(true)}>
            {t("action.logActivity")}
          </button>
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("action.edit")}
          </button>
          <button className="btn btn-danger" onClick={() => setDeleting(true)}>
            {t("action.delete")}
          </button>
        </div>
      </PageHeader>
      <div className="detail-grid">
        <div className="card">
          <h2>{t("field.details")}</h2>
          <ContactFacts contact={contact} org={org} />
        </div>
        <div className="card">
          <h2>
            {t("field.deals")} ({deals?.length ?? 0})
          </h2>
          <DealList deals={deals ?? []} />
        </div>
        <div className="card full">
          <h2>{t("field.activity")}</h2>
          <ActivityTimeline
            activities={activities ?? []}
            onChanged={reloadActivities}
          />
        </div>
      </div>
      {logging && (
        <ActivityForm
          contactId={contact.id}
          onSaved={reloadActivities}
          onClose={() => setLogging(false)}
        />
      )}
      {editing && (
        <ContactForm
          existing={contact}
          organizations={orgs ?? []}
          onSaved={reload}
          onClose={() => setEditing(false)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={t("contacts.confirmTitle")}
          message={t("contacts.confirmDetail", { name: contact.name })}
          onConfirm={() => void remove()}
          onCancel={() => setDeleting(false)}
        />
      )}
    </>
  );
}
