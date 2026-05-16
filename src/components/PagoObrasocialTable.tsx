"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, ChevronDown, ChevronRight, Trash2, X } from "lucide-react";
import { addCoseguroPago, updatePagoObrasocialSeguimiento, deletePagoObrasocial } from "@/actions/listados";

const SEGUIMIENTO_OPTIONS = ['Pendiente', 'En Proceso', 'Completo'];

const SEGUIMIENTO_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Pendiente: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '#EF4444' },
  'En Proceso': { bg: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '#FBBF24' },
  Completo: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: '#10B981' },
};

export default function PagoObrasocialTable({ data }: { data: any[] }) {
  const [items, setItems] = useState(data);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [addingFor, setAddingFor] = useState<number | null>(null);
  const [newPago, setNewPago] = useState({ monto: '', fecha: '', detalle: '' });
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = items.filter(it =>
    !searchTerm || it.paciente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groups = filtered.reduce((acc: any, item: any) => {
    const month = item.month_group || 'sin-fecha';
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {});
  const sortedMonths = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  function toggleExpand(id: number) {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  }

  async function handleAddPago(item: any) {
    if (!newPago.monto || !newPago.fecha) { alert("Completá monto y fecha."); return; }
    setLoadingId(item.id);
    const res = await addCoseguroPago(item.id, parseFloat(newPago.monto), newPago.fecha, newPago.detalle);
    if (res.error) {
      alert(res.error);
    } else {
      const pagoEntry = { monto: newPago.monto, fecha: newPago.fecha, detalle: newPago.detalle, created_at: new Date().toISOString() };
      setItems(items.map(it => it.id === item.id
        ? { ...it, pagos: [...(it.pagos || []), pagoEntry], total_pagado: (parseFloat(it.total_pagado || 0) + parseFloat(newPago.monto)).toFixed(2) }
        : it
      ));
      setNewPago({ monto: '', fecha: '', detalle: '' });
      setAddingFor(null);
      if (!expanded.has(item.id)) toggleExpand(item.id);
    }
    setLoadingId(null);
  }

  async function handleSeguimiento(id: number, seguimiento: string) {
    const res = await updatePagoObrasocialSeguimiento(id, seguimiento);
    if (!res.error) setItems(items.map(it => it.id === id ? { ...it, seguimiento } : it));
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este registro?")) return;
    const res = await deletePagoObrasocial(id);
    if (!res.error) setItems(items.filter(it => it.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Search */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <input
          type="text"
          placeholder="Buscar paciente..."
          className="input-field"
          style={{ maxWidth: '280px' }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {sortedMonths.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No hay registros de pago de obra social. Activá el botón "AGREGADO" en el campo de coseguro al crear ingresos.
        </div>
      )}

      {sortedMonths.map(month => (
        <div key={month} className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-gradient-end)', borderBottom: '1px solid var(--glass-border)' }}>
            <h4 style={{ margin: 0, textTransform: 'capitalize' }}>
              {month !== 'sin-fecha' ? format(new Date(month + '-02'), 'MMMM yyyy', { locale: es }) : 'Sin fecha'}
            </h4>
          </div>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.75rem 1rem', width: '32px' }} />
                  <th style={{ padding: '0.75rem 1rem' }}>Fecha</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Paciente</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Pendiente (Coseguro)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total Pagado</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Seguimiento</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {groups[month].map((item: any) => {
                  const isExpanded = expanded.has(item.id);
                  const isComplete = item.seguimiento === 'Completo';
                  const seg = SEGUIMIENTO_STYLES[item.seguimiento] || SEGUIMIENTO_STYLES['Pendiente'];
                  return (
                    <>
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)', background: isExpanded ? 'rgba(14,165,233,0.03)' : 'transparent' }}>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                          <button
                            onClick={() => toggleExpand(item.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                          {item.fecha ? format(new Date(item.fecha), 'dd/MM/yyyy') : '-'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{item.paciente}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--success)' }}>
                          ${parseFloat(item.coseguro_pendiente || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                          ${parseFloat(item.total_pagado || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <select
                            value={item.seguimiento}
                            onChange={e => handleSeguimiento(item.id, e.target.value)}
                            style={{
                              padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                              border: `1px solid ${seg.border}`, background: seg.bg, color: seg.color, outline: 'none'
                            }}
                          >
                            {SEGUIMIENTO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            {!isComplete && (
                              <button
                                onClick={() => { setAddingFor(addingFor === item.id ? null : item.id); setNewPago({ monto: '', fecha: format(new Date(), 'yyyy-MM-dd'), detalle: '' }); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.08)', padding: '0.25rem 0.6rem', borderRadius: '5px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}
                              >
                                <Plus size={14} /> Agregar
                              </button>
                            )}
                            <button onClick={() => handleDelete(item.id)} style={{ color: 'var(--danger)', border: 'none', background: 'none', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Add payment row */}
                      {addingFor === item.id && !isComplete && (
                        <tr key={`add-${item.id}`} style={{ background: 'rgba(14,165,233,0.04)', borderBottom: '1px solid var(--glass-border)' }}>
                          <td colSpan={7} style={{ padding: '0.75rem 1.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Monto $</label>
                                <input type="number" step="0.01" value={newPago.monto} onChange={e => setNewPago({ ...newPago, monto: e.target.value })} className="input-field" style={{ width: '120px' }} placeholder="0.00" />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Fecha</label>
                                <input type="date" value={newPago.fecha} onChange={e => setNewPago({ ...newPago, fecha: e.target.value })} className="input-field" style={{ width: '140px' }} />
                              </div>
                              <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Detalle</label>
                                <input type="text" value={newPago.detalle} onChange={e => setNewPago({ ...newPago, detalle: e.target.value })} className="input-field" placeholder="Observación..." />
                              </div>
                              <button onClick={() => handleAddPago(item)} disabled={loadingId === item.id} className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem' }}>
                                {loadingId === item.id ? '...' : 'Guardar'}
                              </button>
                              <button onClick={() => setAddingFor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Payment history */}
                      {isExpanded && item.pagos && item.pagos.length > 0 && (
                        <tr key={`hist-${item.id}`} style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                          <td colSpan={7} style={{ padding: '0.5rem 1.5rem 1rem 3rem' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>HISTORIAL DE PAGOS</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                                  <th style={{ padding: '0.3rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Fecha</th>
                                  <th style={{ padding: '0.3rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Monto</th>
                                  <th style={{ padding: '0.3rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Detalle</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.pagos.map((p: any, idx: number) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>{p.fecha ? format(new Date(p.fecha), 'dd/MM/yyyy') : '-'}</td>
                                    <td style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>${parseFloat(p.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                    <td style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.detalle || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                      {isExpanded && (!item.pagos || item.pagos.length === 0) && (
                        <tr key={`nohist-${item.id}`} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                          <td colSpan={7} style={{ padding: '0.5rem 3rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin pagos registrados aún.</td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
