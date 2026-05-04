export default function FacturacionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "1rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>Facturación</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Gestión de facturas por obra social.</p>
      </header>
      <main>{children}</main>
    </div>
  );
}
