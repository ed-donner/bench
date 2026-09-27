import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileUp, Upload } from "lucide-react";
import { Link } from "react-router";
import { api, type ImportParsePayload, type ImportRow } from "../api";
import { Modal } from "./Modal";
import { Field } from "./Field";
import { errorMessage } from "../format";
import { useStore } from "../store";
import { useT } from "../strings";

/** The fields a CSV column can map to; the API reads the keys, each labelled from import.field. */
const FIELDS = [
  "name",
  "email",
  "phone",
  "job_title",
  "company",
  "city",
  "birthday",
  "notes",
] as const;

export function ImportModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { refresh } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parse, setParse] = useState<ImportParsePayload | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filename, setFilename] = useState("");
  const [result, setResult] = useState<{
    added: number;
    skipped: number;
  } | null>(null);

  const readAndParse = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const content = await file.text();
      const payload = await api.importParse(file.name, content);
      setFilename(file.name);
      setParse(payload);
      if (payload.format === "csv") {
        setMapping(invertMapping(payload.suggested_mapping ?? {}));
        setRows(payload.rows);
      } else {
        setRows(payload.rows);
      }
      setSelected(
        new Set(
          payload.rows
            .filter((r) => !r.duplicate.isDuplicate)
            .map((r) => r.index),
        ),
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const invertMapping = (m: Record<string, string>): Record<string, string> => {
    // mapping comes back as {header: field}; we want {field: header} for the selects
    const out: Record<string, string> = {};
    for (const [header, field] of Object.entries(m)) out[field] = header;
    return out;
  };

  const remap = async (field: string, header: string) => {
    if (!parse?.headers || !parse.raw_rows) return;
    const next = { ...mapping, [field]: header || undefined } as Record<
      string,
      string
    >;
    setMapping(next);
    setBusy(true);
    try {
      const clean = Object.fromEntries(
        Object.entries(next).filter(([, v]) => v),
      ) as Record<string, string>;
      const { rows: r } = await api.importRemap(
        parse.headers,
        parse.raw_rows,
        invertMapping(clean),
      );
      setRows(r);
      setSelected(
        new Set(r.filter((x) => !x.duplicate.isDuplicate).map((x) => x.index)),
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const doImport = async () => {
    setBusy(true);
    setError(null);
    try {
      const chosen = rows
        .filter((r) => selected.has(r.index))
        .map((r) => r.person);
      const res = await api.importApply(chosen);
      setResult({ added: res.created.length, skipped: res.skipped });
      await refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setParse(null);
    setRows([]);
    setResult(null);
    setError(null);
  };

  const dupCount = rows.filter((r) => r.duplicate.isDuplicate).length;
  const importCount = rows.filter((r) => selected.has(r.index)).length;

  return (
    <Modal
      large
      title={t("import.title")}
      icon={
        <Upload size={17} className="lucide" style={{ color: "var(--blue)" }} />
      }
      onClose={onClose}
      footer={
        <ImportFooter
          result={result}
          started={parse !== null}
          error={error}
          busy={busy}
          importCount={importCount}
          onReset={reset}
          onClose={onClose}
          onImport={() => void doImport()}
        />
      }
    >
      {!parse && !result && (
        <>
          <p className="muted" style={{ marginTop: 0 }}>
            {t("import.intro")}
          </p>
          <button
            type="button"
            className="import-drop"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            <FileUp size={26} />
            <div className="strong">
              {busy ? t("import.reading") : t("import.choose")}
            </div>
            <div className="small">{t("import.local")}</div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.vcf,text/csv,text/vcard"
            className="visually-hidden"
            aria-label={t("import.file")}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void readAndParse(f);
            }}
          />
          {error && <p style={{ color: "var(--red)" }}>{error}</p>}
        </>
      )}

      {parse && !result && (
        <>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div className="row" style={{ gap: 8 }}>
              <span className="step-dot on">1</span>
              <span style={{ fontWeight: 600 }}>{filename}</span>
              <span className="muted small">
                {parse.format === "vcf" ? t("import.vcf") : t("import.csv")} ·{" "}
                {t("import.found", { count: rows.length })}
              </span>
            </div>
            {dupCount > 0 && (
              <span className="dup-flag">
                <AlertTriangle size={12} />{" "}
                {t("import.dupSkipped", { count: dupCount })}
              </span>
            )}
          </div>

          {parse.format === "csv" && parse.headers && (
            <div
              className="card"
              style={{
                padding: "12px 16px",
                marginBottom: 14,
                boxShadow: "none",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {t("import.map")}
              </div>
              <div className="form-grid">
                {FIELDS.map((f) => (
                  <Field label={t(`import.field.${f}`)} key={f}>
                    <select
                      value={mapping[f] ?? ""}
                      onChange={(e) => void remap(f, e.target.value)}
                    >
                      <option value="">{t("import.notImported")}</option>
                      {parse.headers!.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </Field>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            {t("import.preview")}
          </div>
          <div className="import-review">
            <table className="data">
              <thead>
                <tr>
                  <th style={{ width: 30 }}></th>
                  <th>{t("import.field.name")}</th>
                  <th>{t("import.field.email")}</th>
                  <th>{t("import.field.company")}</th>
                  <th>{t("import.field.city")}</th>
                  <th>{t("import.field.notes")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.index}
                    style={
                      r.duplicate.isDuplicate
                        ? { background: "var(--red-soft)" }
                        : undefined
                    }
                  >
                    <td>
                      <input
                        type="checkbox"
                        aria-label={t("import.row", { name: r.person.name })}
                        disabled={r.duplicate.isDuplicate}
                        checked={selected.has(r.index)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(r.index);
                          else next.delete(r.index);
                          setSelected(next);
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.person.name}</div>
                      {r.duplicate.isDuplicate && (
                        <span className="dup-flag">
                          <AlertTriangle size={11} /> {t("import.already")}{" "}
                          <Link
                            to={`/people/${r.duplicate.duplicateOfId}`}
                            onClick={onClose}
                          >
                            {r.duplicate.duplicateOfName}
                          </Link>{" "}
                          {r.duplicate.reason &&
                            t(`import.matchedBy.${r.duplicate.reason}`)}
                        </span>
                      )}
                    </td>
                    <td>{r.person.email ?? "—"}</td>
                    <td>{r.person.company ?? "—"}</td>
                    <td>{r.person.city ?? "—"}</td>
                    <td className="news-cell">{r.person.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small" style={{ marginBottom: 0 }}>
            {t("import.footnote")}
          </p>
        </>
      )}
    </Modal>
  );
}

/** The footer moves through three states: choosing a file, reviewing it, and done. */
function ImportFooter({
  result,
  started,
  error,
  busy,
  importCount,
  onReset,
  onClose,
  onImport,
}: {
  result: { added: number; skipped: number } | null;
  started: boolean;
  error: string | null;
  busy: boolean;
  importCount: number;
  onReset: () => void;
  onClose: () => void;
  onImport: () => void;
}) {
  const t = useT();
  if (result)
    return (
      <>
        <span className="import-done">
          <CheckCircle2 size={15} />{" "}
          {t("import.imported", { count: result.added })}
          {result.skipped > 0 && (
            <span className="muted">
              · {t("import.skipped", { count: result.skipped })}
            </span>
          )}
        </span>
        <button className="btn" onClick={onReset}>
          {t("import.another")}
        </button>
        <button className="btn btn-primary" onClick={onClose}>
          {t("import.done")}
        </button>
      </>
    );

  if (!started)
    return (
      <button className="btn" onClick={onClose}>
        {t("common.cancel")}
      </button>
    );

  return (
    <>
      {error && <span className="form-error">{error}</span>}
      <button className="btn" onClick={onReset} disabled={busy}>
        {t("import.startOver")}
      </button>
      <button
        className="btn btn-primary"
        onClick={onImport}
        disabled={busy || importCount === 0}
      >
        {busy
          ? t("import.importing")
          : t("import.apply", { count: importCount })}
      </button>
    </>
  );
}
