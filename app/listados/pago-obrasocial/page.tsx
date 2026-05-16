import { getPagoObrasocial } from "@/actions/listados";
import { ensureIngresosExtColumns } from "@/actions/ingresos";
import PagoObrasocialTable from "@/components/PagoObrasocialTable";

export const revalidate = 0;

export default async function PagoObrasocialPage() {
  await ensureIngresosExtColumns();
  const { data, error } = await getPagoObrasocial();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      <PagoObrasocialTable data={data || []} />
    </div>
  );
}
