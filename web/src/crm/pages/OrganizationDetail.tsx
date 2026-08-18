import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../api";
import { useFetch } from "../hooks";
import { Contact, Deal, Organization } from "../types";
import OrganizationForm from "../components/OrganizationForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { ContactList, DealList } from "../components/RelatedLists";
import PageHeader from "../components/PageHeader";
import { IconOrganizations } from "../components/Icons";
import { useTranslation } from "react-i18next";

function OrganizationFacts({ org }: { org: Organization }) {
  const { t } = useTranslation("crm");
  return (
    <dl className="props">
      <dt>{t("field.website")}</dt>
      <dd>{org.website || "—"}</dd>
      <dt>{t("field.industry")}</dt>
      <dd>{org.industry || "—"}</dd>
      <dt>{t("field.notes")}</dt>
      <dd>{org.notes || "—"}</dd>
    </dl>
  );
}

export default function OrganizationDetail() {
  const { t } = useTranslation("crm");
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { data: org, reload } = useFetch<Organization>(
    `/api/crm/organizations/${id}`,
  );
  const { data: contacts } = useFetch<Contact[]>(
    `/api/crm/contacts?organization_id=${id}`,
  );
  const { data: deals } = useFetch<Deal[]>(
    `/api/crm/deals?organization_id=${id}`,
  );

  if (!org) return null;

  async function remove() {
    await api.delete(`/api/crm/organizations/${id}`);
    void navigate("/organizations");
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/organizations">{t("organizations.title")}</Link> / {org.name}
      </div>
      <PageHeader
        icon={<IconOrganizations size={20} />}
        title={org.name}
        sub={org.industry || t("empty.organizationFallback")}
      >
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("action.edit")}
          </button>
          <button className="btn btn-danger" onClick={() => setDeleting(true)}>
            {t("action.delete")}
          </button>
        </div>
      </PageHeader>
      <div className="detail-grid">
        <div className="card full">
          <h2>{t("field.details")}</h2>
          <OrganizationFacts org={org} />
        </div>
        <div className="card">
          <h2>
            {t("field.contacts")} ({contacts?.length ?? 0})
          </h2>
          <ContactList contacts={contacts ?? []} />
        </div>
        <div className="card">
          <h2>
            {t("field.deals")} ({deals?.length ?? 0})
          </h2>
          <DealList deals={deals ?? []} />
        </div>
      </div>
      {editing && (
        <OrganizationForm
          existing={org}
          onSaved={reload}
          onClose={() => setEditing(false)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={t("organizations.confirmTitle")}
          message={t("organizations.confirmDetail", { name: org.name })}
          onConfirm={() => void remove()}
          onCancel={() => setDeleting(false)}
        />
      )}
    </>
  );
}
