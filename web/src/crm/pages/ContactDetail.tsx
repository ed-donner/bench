import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useT } from "../../shared/useLocale";
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

function ContactFacts({
  contact,
  org,
}: {
  contact: Contact;
  org?: Organization;
}) {
  const t = useT();

  return (
    <dl className="props">
      <dt>{t("crm.contacts.facts.status")}</dt>
      <dd>
        <StatusChip status={contact.status} />
      </dd>
      <dt>{t("crm.contacts.facts.email")}</dt>
      <dd>{contact.email || t("shared.common.emDash")}</dd>
      <dt>{t("crm.contacts.facts.phone")}</dt>
      <dd>{contact.phone || t("shared.common.emDash")}</dd>
      <dt>{t("crm.contacts.facts.jobTitle")}</dt>
      <dd>{contact.job_title || t("shared.common.emDash")}</dd>
      <dt>{t("crm.contacts.facts.organization")}</dt>
      <dd>
        {org ? (
          <Link className="entity-link" to={`/organizations/${org.id}`}>
            {org.name}
          </Link>
        ) : (
          t("shared.common.emDash")
        )}
      </dd>
    </dl>
  );
}

export default function ContactDetail() {
  const t = useT();
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
  const atOrg = org ? t("crm.contacts.atOrg", { orgName: org.name }) : "";

  if (!contact) return null;

  async function remove() {
    await api.delete(`/api/crm/contacts/${id}`);
    void navigate("/contacts");
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/contacts">{t("crm.nav.contacts")}</Link> / {contact.name}
      </div>
      <PageHeader
        icon={<IconContacts size={20} />}
        title={contact.name}
        sub={(contact.job_title || t("crm.contacts.fallbackSub")) + atOrg}
      >
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setLogging(true)}>
            {t("crm.contacts.logActivity")}
          </button>
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("shared.common.edit")}
          </button>
          <button className="btn btn-danger" onClick={() => setDeleting(true)}>
            {t("shared.common.delete")}
          </button>
        </div>
      </PageHeader>
      <div className="detail-grid">
        <div className="card">
          <h2>{t("shared.common.details")}</h2>
          <ContactFacts contact={contact} org={org} />
        </div>
        <div className="card">
          <h2>
            {t("crm.organizations.dealsSection", {
              count: deals?.length ?? 0,
            })}
          </h2>
          <DealList deals={deals ?? []} />
        </div>
        <div className="card full">
          <h2>{t("crm.contacts.activitySection")}</h2>
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
          title={t("crm.contacts.deleteTitle")}
          message={t("crm.contacts.deleteMessageQuoted", {
            name: contact.name,
          })}
          onConfirm={() => void remove()}
          onCancel={() => setDeleting(false)}
        />
      )}
    </>
  );
}
