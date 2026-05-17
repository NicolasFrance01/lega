import { ensureOsdeCodesTable, getOsdeCodes } from "@/actions/listados";
import OsdeCodesTable from "@/components/OsdeCodesTable";

export const revalidate = 0;

export default async function OsdePage() {
  await ensureOsdeCodesTable();
  const { data, error } = await getOsdeCodes();

  if (error) return <div className="glass-panel" style={{ padding: "2rem", color: "var(--danger)" }}>Error: {error}</div>;

  return <OsdeCodesTable data={data || []} />;
}
