import { getSession } from "@/lib/auth";
import IngresosPageClient from "@/components/IngresosPageClient";

export default async function IngresosPage() {
  const session = await getSession() as any;
  const userRole: string = session?.role || 'staff';
  return <IngresosPageClient userRole={userRole} />;
}
