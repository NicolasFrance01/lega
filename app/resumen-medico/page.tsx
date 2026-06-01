import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import MedicalResultsManager from "@/components/MedicalResultsManager";

export default async function ResumenMedicoPage() {
  const session = await getSession() as any;
  if (!session) redirect("/login");
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Resumen Médico</h2>
        <p style={{ color: 'var(--text-muted)' }}>Gestión de resultados, informes y avisos a pacientes.</p>
      </header>
      
      <div className="glass-panel" style={{ flex: 1, padding: '2rem' }}>
        <MedicalResultsManager currentUser={session} />
      </div>
    </div>
  );
}
