import { Link } from "react-router";
import { CornerUpLeft } from "lucide-react";
import { useLocale } from "../../shared/useLocale";
import { api, type RowData } from "../api";
import Cell from "./cells";
import { nextColor } from "./optionColors";

export function RowBreadcrumb({ row }: { row: RowData }) {
  const { t } = useLocale();
  return (
    <Link className="row-breadcrumb" to={`/p/${row.database_id}`}>
      <CornerUpLeft size={13} />
      {row.database_title || t("page.untitledDatabase")}
    </Link>
  );
}

export function RowPropsGrid({
  row,
  onRowChange,
}: {
  row: RowData;
  onRowChange: (row: RowData) => void;
}) {
  const { t } = useLocale();
  const setValue = (propertyId: string, value: unknown) => {
    onRowChange({ ...row, values: { ...row.values, [propertyId]: value } });
    void api.setRowValue(row.id, propertyId, value);
  };

  const createOption = async (propertyId: string, name: string) => {
    const prop = row.properties.find((p) => p.id === propertyId);
    const option = await api.addOption(propertyId, {
      name,
      color: nextColor(prop?.options ?? []),
    });
    onRowChange({
      ...row,
      properties: row.properties.map((p) =>
        p.id === propertyId ? { ...p, options: [...p.options, option] } : p,
      ),
    });
    return option;
  };

  const rowLabel = row.title || t("common.untitled");

  return (
    <div className="row-props">
      <dl className="props-grid">
        {row.properties.map((p) => (
          <div className="props-row" key={p.id}>
            <dt title={t(`propertyType.${p.type}`)}>{p.name}</dt>
            <dd>
              <Cell
                property={p}
                value={row.values[p.id]}
                rowLabel={rowLabel}
                onChange={(v) => setValue(p.id, v)}
                onCreateOption={(name) => createOption(p.id, name)}
              />
            </dd>
          </div>
        ))}
      </dl>
      <hr className="props-divider" />
    </div>
  );
}
