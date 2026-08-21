import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../api";
import { useFetch } from "../hooks";
import { useLocale } from "../../shared/useLocale";
import { Contact, Deal, Organization } from "../types";
import OrganizationForm from "../components/OrganizationForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { ContactList, DealList } from "../components/RelatedLists";
import PageHeader from "../components/PageHeader";
import { IconOrganizations } from "../components/Icons";

function OrganizationFacts({ org }: { org: Organization }) {
  const { t } = useLocale();
  return (
    <dl className="props">
      <dt>{t("common.website")}</dt>
      <dd>{org.website || t("common.dash")}</dd>
      <dt>{t("common.industry")}</dt>
      <dd>{org.industry || t("common.dash")}</dd>
      <dt>{t("common.notes")}</dt>
      <dd>{org.notes || t("common.dash")}</dd>
    </dl>
  );
}

export default function OrganizationDetail() {
  const { t } = useLocale();
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
        <Link to="/organizations">{t("breadcrumb.organizations")}</Link> /{" "}
        {org.name}
      </div>
      <PageHeader
        icon={<IconOrganizations size={20} />}
        title={org.name}
        sub={org.industry || t("organizations.fallbackSub")}
      >
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            {t("common.edit")}
          </button>
          <button className="btn btn-danger" onClick={() => setDeleting(true)}>
            {t("common.delete")}
          </button>
        </div>
      </PageHeader>
      <div className="detail-grid">
        <div className="card full">
          <h2>{t("common.details")}</h2>
          <OrganizationFacts org={org} />
        </div>
        <div className="card">
          <h2>
            {t("common.contacts")} ({contacts?.length ?? 0})
          </h2>
          <ContactList contacts={contacts ?? []} />
        </div>
        <div className="card">
          <h2>
            {t("common.deals")} ({deals?.length ?? 0})
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
          title={t("organizations.deleteTitle")}
          message={t("organizations.deleteMessageQuoted", { name: org.name })}
          onConfirm={() => void remove()}
          onCancel={() => setDeleting(false)}
        />
      )}
    </>
  );
}
