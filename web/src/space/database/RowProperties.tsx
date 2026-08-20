import { Link } from "react-router";
import { CornerUpLeft } from "lucide-react";
import { useT } from "../../shared/useLocale";
import { api, type RowData } from "../api";
import Cell from "./cells";
import { nextColor } from "./optionColors";
import { propertyTypeLabel } from "../i18n";

export function RowBreadcrumb({ row }: { row: RowData }) {
  const t = useT("space");
  return (
    <Link className="row-breadcrumb" to={`/p/${row.database_id}`}>
      <CornerUpLeft size={13} />
      {row.database_title || t("untitledDatabase")}
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
  const t = useT("space");
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

  return (
    <div className="row-props">
      <dl className="props-grid">
        {row.properties.map((p) => (
          <div className="props-row" key={p.id}>
            <dt title={propertyTypeLabel(p.type, t)}>{p.name}</dt>
            <dd>
              <Cell
                property={p}
                value={row.values[p.id]}
                rowLabel={row.title || t("untitled")}
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
