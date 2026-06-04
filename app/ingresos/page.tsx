import { getSession } from "@/lib/auth";
import IngresosPageClient from "@/components/IngresosPageClient";
import { ensureIngresosExtColumns } from "@/actions/ingresos";
import { Suspense } from "react";

export default async function IngresosPage() {
  const session = await getSession() as any;
  const userRole: string = session?.role || 'staff';
  await ensureIngresosExtColumns();
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <IngresosPageClient userRole={userRole} />
    </Suspense>
  );
}
