"use client";

import { useState } from "react";
import { updateOsdeCode, createOsdeCode, deleteOsdeCode } from "@/actions/listados";
import { Search, Save, X, Plus, Trash2 } from "lucide-react";

const ESTADOS = ['Requiere Autorización', 'No Requiere Autorización'] as const;
type Estado = typeof ESTADOS[number];

const ESTADO_STYLE: Record<Estado, { bg: string; color: string; border: string }> = {
  'Requiere Autorización':    { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: '#EF4444' },
  'No Requiere Autorización': { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: '#10B981' },
};

function EstadoBadge({ estado, onClick }: { estado: string; onClick?: () => void }) {
  const key = ESTADOS.includes(estado as Estado) ? (estado as Estado) : 'Requiere Autorización';
  const s = ESTADO_STYLE[key];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        cursor: onClick ? 'pointer' : 'default', whiteSpace: 'nowrap', transition: 'all 0.15s',
      }}
    >
      {key}
    </button>
  );
}

export default function OsdeCodesTable({ data }: { data: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState(data);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [showNewRow, setShowNewRow] = useState(false);
  const [newEstado, setNewEstado] = useState<Estado>('Requiere Autorización');

  const filteredItems = items.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.analisis?.toLowerCase().includes(q) ||
      (item.codigo_sistema && item.codigo_sistema.toLowerCase().includes(q)) ||
      (item.estado && item.estado.toLowerCase().includes(q))
    );
  });

  async function handleSave(id: number) {
    const res = await updateOsdeCode(id, editValues);
    if (!res.error) {
      setItems(prev => prev.map(it => it.id === id ? { ...it, ...editValues } : it));
      setEditingId(null);
    } else {
      alert(res.error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este código?")) return;
    const res = await deleteOsdeCode(id);
    if (!res.error) setItems(prev => prev.filter(it => it.id !== id));
  }

  async function handleToggleEstado(id: number, current: string) {
    const next: Estado = current === 'No Requiere Autorización'
      ? 'Requiere Autorización'
      : 'No Requiere Autorización';
    const res = await updateOsdeCode(id, { estado: next });
    if (!res.error) setItems(prev => prev.map(it => it.id === id ? { ...it, estado: next } : it));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div className="glass-panel" style={{ flex: 1, padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <Search size={20} style={{ color: "var(--text-muted)" }} />
          <input
            className="input-field"
            placeholder="Buscar por análisis, código o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", background: "transparent", boxShadow: "none", padding: 0 }}
          />
        </div>
        <button onClick={() => { setShowNewRow(true); setNewEstado('Requiere Autorización'); }} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}>
          <Plus size={18} /> Nuevo Item
        </button>
      </div>

      {showNewRow && (
        <form action={async (fd) => {
          fd.set("estado", newEstado);
          const res = await createOsdeCode(fd);
          if (!res.error) window.location.reload();
        }} className="glass-panel" style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: "1rem", alignItems: "end" }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Nombre del Análisis</label>
            <input name="analisis" required className="input-field" placeholder="Ej: Ferritina" />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Código de Autorización</label>
            <input name="codigo_sistema" className="input-field" placeholder="Ej: 1234" />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Estado</label>
            <EstadoBadge estado={newEstado} onClick={() => setNewEstado(
              newEstado === 'Requiere Autorización' ? 'No Requiere Autorización' : 'Requiere Autorización'
            )} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", paddingBottom: "0.05rem" }}>
            <button type="submit" className="btn-primary">Guardar</button>
            <button type="button" onClick={() => setShowNewRow(false)} style={{ color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
          </div>
        </form>
      )}

      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "0.85rem", borderBottom: "1px solid var(--glass-border)", background: "var(--bg-gradient-end)" }}>
                <th style={{ padding: "1rem" }}>Análisis</th>
                <th style={{ padding: "1rem" }}>Código de Autorización</th>
                <th style={{ padding: "1rem" }}>Estado</th>
                <th style={{ padding: "1rem", width: "120px" }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item: any) => (
                <tr key={item.id} className="hoverable-row" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                  <td style={{ padding: "1rem", fontSize: "0.9rem", fontWeight: 500 }}>
                    {editingId === item.id ? (
                      <input
                        className="input-field"
                        defaultValue={item.analisis}
                        onChange={(e) => setEditValues({ ...editValues, analisis: e.target.value })}
                      />
                    ) : item.analisis}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingId === item.id ? (
                      <input
                        className="input-field"
                        defaultValue={item.codigo_sistema}
                        onChange={(e) => setEditValues({ ...editValues, codigo_sistema: e.target.value })}
                      />
                    ) : (
                      <span style={{ fontFamily: "monospace", color: "var(--primary)", fontWeight: 600 }}>
                        {item.codigo_sistema || "-"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingId === item.id ? (
                      <EstadoBadge
                        estado={editValues.estado ?? item.estado}
                        onClick={() => setEditValues({
                          ...editValues,
                          estado: (editValues.estado ?? item.estado) === 'No Requiere Autorización'
                            ? 'Requiere Autorización'
                            : 'No Requiere Autorización'
                        })}
                      />
                    ) : (
                      <EstadoBadge
                        estado={item.estado || 'Requiere Autorización'}
                        onClick={() => handleToggleEstado(item.id, item.estado || 'Requiere Autorización')}
                      />
                    )}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      {editingId === item.id ? (
                        <>
                          <button onClick={() => handleSave(item.id)} style={{ color: "var(--success)" }}><Save size={18} /></button>
                          <button onClick={() => setEditingId(null)}><X size={18} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(item.id); setEditValues({ analisis: item.analisis, codigo_sistema: item.codigo_sistema, estado: item.estado }); }} style={{ color: "var(--primary)", fontSize: "0.85rem" }}>
                            Editar
                          </button>
                          <button onClick={() => handleDelete(item.id)} style={{ color: "var(--danger)" }}><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
