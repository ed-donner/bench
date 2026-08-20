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
  const ts = useT("shared");
  const tc = useT("crm");
  return (
    <dl className="props">
      <dt>{ts("status")}</dt>
      <dd>
        <StatusChip status={contact.status} />
      </dd>
      <dt>{tc("email")}</dt>
      <dd>{contact.email || tc("emDash")}</dd>
      <dt>{tc("phone")}</dt>
      <dd>{contact.phone || tc("emDash")}</dd>
      <dt>{tc("jobTitle")}</dt>
      <dd>{contact.job_title || tc("emDash")}</dd>
      <dt>{tc("organization")}</dt>
      <dd>
        {org ? (
          <Link className="entity-link" to={`/organizations/${org.id}`}>
            {org.name}
          </Link>
        ) : (
          tc("emDash")
        )}
      </dd>
    </dl>
  );
}

export default function ContactDetail() {
  const ts = useT("shared");
  const tc = useT("crm");
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
  const atOrg = org ? tc.i("atOrganization", { name: org.name }) : "";

  if (!contact) return null;

  async function remove() {
    await api.delete(`/api/crm/contacts/${id}`);
    void navigate("/contacts");
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/contacts">{tc("navContacts")}</Link> / {contact.name}
      </div>
      <PageHeader
        icon={<IconContacts size={20} />}
        title={contact.name}
        sub={(contact.job_title || tc("contactFallback")) + atOrg}
      >
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setLogging(true)}>
            {tc("logActivity")}
          </button>
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            {ts("edit")}
          </button>
          <button className="btn btn-danger" onClick={() => setDeleting(true)}>
            {ts("delete")}
          </button>
        </div>
      </PageHeader>
      <div className="detail-grid">
        <div className="card">
          <h2>{tc("details")}</h2>
          <ContactFacts contact={contact} org={org} />
        </div>
        <div className="card">
          <h2>
            {tc("sectionDeals")} ({deals?.length ?? 0})
          </h2>
          <DealList deals={deals ?? []} />
        </div>
        <div className="card full">
          <h2>{tc("activitySection")}</h2>
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
          title={tc("deleteContact")}
          message={tc.i("deleteNamedMessage", { name: contact.name })}
          onConfirm={() => void remove()}
          onCancel={() => setDeleting(false)}
        />
      )}
    </>
  );
}
