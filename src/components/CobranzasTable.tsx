"use client";

import { useState } from "react";
import { updateCobranza, createCobranza, deleteCobranza } from "@/actions/listados";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Trash2, Save, X, Search } from "lucide-react";

type Tab = 'pendiente' | 'factura_instante' | 'finalizado';

const TAB_LABELS: Record<Tab, string> = {
  pendiente: 'Pendientes',
  factura_instante: 'Facturados al instante',
  finalizado: 'Finalizados',
};

const TAB_COLORS: Record<Tab, { bg: string; text: string; border: string }> = {
  pendiente: { bg: '#EF4444', text: 'white', border: '#EF4444' },
  factura_instante: { bg: '#0EA5E9', text: 'white', border: '#0EA5E9' },
  finalizado: { bg: '#10B981', text: 'white', border: '#10B981' },
};

function formatMethods(method: string | null | undefined): string {
  if (!method) return '-';
  return method.split(',').filter(Boolean).join(' + ') || '-';
}

function getItemTab(item: any): Tab {
  if (item.tipo === 'factura_instante') return 'factura_instante';
  if (item.tipo === 'finalizado' || item.seguimiento === 'Finalizado') return 'finalizado';
  return 'pendiente';
}

export default function CobranzasTable({ data }: { data: any[] }) {
  const [items, setItems] = useState(data);
  const [activeTab, setActiveTab] = useState<Tab>('pendiente');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [showNewRow, setShowNewRow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const counts: Record<Tab, number> = { pendiente: 0, factura_instante: 0, finalizado: 0 };
  items.forEach(it => counts[getItemTab(it)]++);

  const filtered = items.filter(it => {
    if (getItemTab(it) !== activeTab) return false;
    const s = searchTerm.toLowerCase();
    if (!s) return true;
    return (
      it.paciente?.toLowerCase().includes(s) ||
      it.observacion?.toLowerCase().includes(s) ||
      it.nro_factura?.toLowerCase().includes(s) ||
      it.fecha?.includes(s)
    );
  });

  const groups = filtered.reduce((acc: any, item: any) => {
    const month = item.month_group || 'sin-fecha';
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {});
  const sortedMonths = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  async function handleSave(id: number) {
    const res = await updateCobranza(id, editValues);
    if (!res.error) {
      setItems(items.map(it => it.id === id ? { ...it, ...editValues } : it));
      setEditingId(null);
    } else {
      alert(res.error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este registro?")) return;
    const res = await deleteCobranza(id);
    if (!res.error) setItems(items.filter(it => it.id !== id));
  }

  async function handleMoveToFinalizado(id: number) {
    const res = await updateCobranza(id, { tipo: 'finalizado', seguimiento: 'Finalizado' });
    if (!res.error) setItems(items.map(it => it.id === id ? { ...it, tipo: 'finalizado', seguimiento: 'Finalizado' } : it));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {(Object.keys(TAB_LABELS) as Tab[]).map(tab => {
          const active = activeTab === tab;
          const col = TAB_COLORS[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.5rem 1.25rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 700,
                border: `1px solid ${col.border}`,
                background: active ? col.bg : `${col.bg}18`,
                color: active ? col.text : col.bg,
                display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s"
              }}
            >
              {TAB_LABELS[tab]}
              <span style={{ padding: "0.1rem 0.45rem", borderRadius: "4px", background: "rgba(0,0,0,0.15)", fontSize: "0.75rem" }}>
                {counts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + New */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", maxWidth: "300px", width: "100%" }}>
          <Search size={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input type="text" placeholder="Buscar..." className="input-field" style={{ paddingLeft: "2.5rem" }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => setShowNewRow(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}>
          <Plus size={18} /> Nueva Facturación
        </button>
      </div>

      {/* New Record Form */}
      {showNewRow && (
        <form
          action={async (fd) => {
            const res = await createCobranza(fd);
            if (!res.error) window.location.reload();
          }}
          className="glass-panel"
          style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", alignItems: "end" }}
        >
          <input type="hidden" name="tipo" value={activeTab} />
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Fecha</label>
            <input name="fecha" type="date" required className="input-field" defaultValue={format(new Date(), "yyyy-MM-dd")} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Paciente</label>
            <input name="paciente" required className="input-field" placeholder="Nombre completo" />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>DNI</label>
            <input name="dni" className="input-field" placeholder="DNI" />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Nro. Factura</label>
            <input name="nro_factura" className="input-field" placeholder="001-0001" />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Coseguro $</label>
            <input name="coseguro_amount" type="number" step="0.01" className="input-field" placeholder="0.00" />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Particular $</label>
            <input name="particular_amount" type="number" step="0.01" className="input-field" placeholder="0.00" />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Observación</label>
            <input name="observacion" className="input-field" placeholder="Detalles adicionales..." />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="btn-primary">Guardar</button>
            <button type="button" onClick={() => setShowNewRow(false)} style={{ color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}><X /></button>
          </div>
        </form>
      )}

      {/* Data Tables */}
      {sortedMonths.length > 0 ? sortedMonths.map(month => (
        <div key={month} className="glass-panel" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", background: "var(--bg-gradient-end)", borderBottom: "1px solid var(--glass-border)" }}>
            <h4 style={{ margin: 0, textTransform: "capitalize" }}>
              {month !== 'sin-fecha' ? format(new Date(month + "-02"), "MMMM yyyy", { locale: es }) : 'Sin fecha'}
            </h4>
          </div>
          <div className="table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "0.8rem", borderBottom: "1px solid var(--glass-border)" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>Fecha</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Paciente</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Coseguro</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Particular</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Total</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Observación</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Nro. Factura</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Estado</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {groups[month].map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      {item.fecha ? format(new Date(item.fecha), "dd/MM/yyyy") : '-'}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ fontWeight: 600 }}>{item.paciente}</div>
                      {item.dni && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.dni}</div>}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {item.coseguro_amount ? (
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--success)' }}>${parseFloat(item.coseguro_amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{formatMethods(item.coseguro_method)}</div>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {item.particular_amount ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>${parseFloat(item.particular_amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{formatMethods(item.particular_method)}</div>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>
                      {item.total ? `$${parseFloat(item.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", maxWidth: "160px" }}>
                      {editingId === item.id ? (
                        <input className="input-field" defaultValue={item.observacion} onChange={(e) => setEditValues({ ...editValues, observacion: e.target.value })} />
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.observacion || '-'}</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {editingId === item.id ? (
                        <input className="input-field" defaultValue={item.nro_factura} onChange={(e) => setEditValues({ ...editValues, nro_factura: e.target.value })} placeholder="001-0001" />
                      ) : (item.nro_factura || '-')}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {editingId === item.id ? (
                        <select className="input-field" defaultValue={item.estado_factura || 'NO FACTURADO'} onChange={(e) => setEditValues({ ...editValues, estado_factura: e.target.value })}>
                          <option value="NO FACTURADO">NO FACTURADO</option>
                          <option value="FACTURADO">FACTURADO</option>
                        </select>
                      ) : (
                        <span style={{
                          padding: "0.2rem 0.55rem", borderRadius: "5px", fontSize: "0.75rem", fontWeight: 700,
                          background: item.estado_factura === 'FACTURADO' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
                          color: item.estado_factura === 'FACTURADO' ? '#10B981' : '#EF4444',
                          border: `1px solid ${item.estado_factura === 'FACTURADO' ? '#10B981' : '#EF4444'}`
                        }}>
                          {item.estado_factura || 'NO FACTURADO'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                        {editingId === item.id ? (
                          <>
                            <button onClick={() => handleSave(item.id)} style={{ color: "var(--success)", border: "none", background: "none", cursor: "pointer" }}><Save size={18} /></button>
                            <button onClick={() => setEditingId(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(item.id); setEditValues({ observacion: item.observacion, nro_factura: item.nro_factura, estado_factura: item.estado_factura }); }} style={{ color: "var(--primary)", border: "none", background: "rgba(14,165,233,0.1)", padding: "0.25rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }}>Editar</button>
                            {activeTab !== 'finalizado' && (
                              <button onClick={() => handleMoveToFinalizado(item.id)} style={{ color: "#10B981", border: "1px solid #10B981", background: "rgba(16,185,129,0.08)", padding: "0.25rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }}>Finalizar</button>
                            )}
                            <button onClick={() => handleDelete(item.id)} style={{ color: "var(--danger)", border: "none", background: "none", cursor: "pointer" }}><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )) : (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          No se encontraron registros en esta sección.
        </div>
      )}
    </div>
  );
}
