import { getApross } from "@/actions/listados";
import AprossTable from "@/components/AprossTable";

export const metadata = {
  title: "Apross - LEGA Laboratorio",
};

export default async function AprossPage() {
  const { data, error } = await getApross();

  if (error) return <div className="glass-panel" style={{ padding: "2rem", color: "var(--danger)" }}>Error: {error}</div>;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.5rem" }}>Listado Apross</h2>
        <p style={{ color: "var(--text-muted)", fontWeight: 500 }}>Control y seguimiento de cargas para Apross.</p>
      </div>
      <AprossTable data={data || []} />
    </div>
  );
}
