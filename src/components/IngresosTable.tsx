"use client";

import { useState, useRef, useEffect } from "react";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Edit2, Trash2, Search, Filter, Calendar as CalendarIcon, Clock, User, Shield, CreditCard, DollarSign, Mail, MapPin, ArrowDown, ArrowUp, Bell } from "lucide-react";
import { updateIngresoField, deleteIngreso, updateInternalNote, markInternalNoteAsRead, updateBiochemicalNotice } from "@/actions/ingresos";

export default function IngresosTable({ ingresos, onEdit, onRefresh, period }: { ingresos: any[], onEdit: (ingreso: any) => void, onRefresh: () => void, period: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const todayRef = useRef<HTMLTableRowElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null);
  const [isAtToday, setIsAtToday] = useState(false);
  const [bellPopup, setBellPopup] = useState<{ id: string, note: string, status: string } | null>(null);
  const [optimisticChecks, setOptimisticChecks] = useState<Record<string, boolean>>({});

  const handleJump = () => {
    if (!isAtToday) {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsAtToday(true);
    } else {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsAtToday(false);
    }
  };

  // Auto-scroll removed as per request

  async function handleToggleCheck(id: string, current: boolean) {
    const newVal = !current;
    // Optimistic Update
    setOptimisticChecks(prev => ({ ...prev, [id]: newVal }));
    
    const res = await updateIngresoField(id, 'checkbox_checked', newVal);
    if (res.success) {
      onRefresh();
    } else {
      // Revert if failed
      setOptimisticChecks(prev => ({ ...prev, [id]: current }));
    }
  }

  async function handleDelete(id: string) {
    if (confirm("¿Estás seguro de eliminar este ingreso?")) {
      const res = await deleteIngreso(id);
      if (res.success) onRefresh();
    }
  }

  async function handleCellEdit(id: string, field: string, value: any) {
    const res = await updateIngresoField(id, field, value);
    if (res.success) onRefresh();
    setEditingCell(null);
  }

  const EditableCell = ({ id, field, value, type = "text", options = [] }: any) => {
    const isEditing = editingCell?.id === id && editingCell?.field === field;
    const [localValue, setLocalValue] = useState(value);

    if (isEditing) {
      if (type === "select") {
        return (
          <select 
            autoFocus
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => handleCellEdit(id, field, localValue)}
            style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--primary)', fontSize: '0.85rem', width: '100%', background: 'var(--glass-bg)', color: 'var(--text-main)' }}
          >
            {options.map((opt: any) => <option key={opt} value={opt} style={{ background: 'var(--glass-bg)', color: 'var(--text-main)' }}>{opt}</option>)}
          </select>
        );
      }
      return (
          <input 
          autoFocus
          type={type}
          value={localValue || ""}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => handleCellEdit(id, field, localValue)}
          onKeyDown={(e) => e.key === 'Enter' && handleCellEdit(id, field, localValue)}
          style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid var(--primary)', fontSize: '0.85rem', width: '100%', background: 'var(--glass-bg)', color: 'var(--text-main)' }}
        />
      );
    }

    return (
      <div 
        onClick={() => setEditingCell({ id, field })}
        style={{ cursor: 'pointer', minHeight: '1.2rem', minWidth: '2rem' }}
        className="editable-cell-hover"
      >
        {type === "number" && value ? `$${value}` : (value || '-')}
      </div>
    );
  };

  if (!ingresos || ingresos.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>No hay ingresos registrados en este periodo.</p>
      </div>
    );
  }

  let lastDate = "";

  return (
    <div style={{ background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden', position: 'relative', backdropFilter: 'blur(10px)' }}>
      <div ref={containerRef} style={{ overflow: 'auto', maxHeight: 'calc(100vh - 50px)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.85rem' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 30 }}>
            <tr style={{ background: '#244c7d', color: 'white', borderBottom: '2px solid var(--glass-border)' }}>
              <th style={{ padding: '0.75rem 1rem', position: 'sticky', left: 0, background: 'var(--table-sticky-bg, #ffffff)', color: 'var(--table-sticky-text, #000000)', zIndex: 31, borderBottom: '2px solid var(--glass-border)' }}>FECHA</th>
              <th style={{ padding: '0.75rem 1rem' }}>RESULTADO</th>
              <th style={{ padding: '0.75rem 1rem' }}>AVISO BIOQ.</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                <Check size={16} />
              </th>
              <th style={{ padding: '0.75rem 1rem' }}>INFORME</th>
              <th style={{ padding: '0.75rem 1rem' }}>NOMBRE</th>
              <th style={{ padding: '0.75rem 1rem' }}>DNI</th>
              <th style={{ padding: '0.75rem 1rem' }}>DIRECCIÓN</th>
              <th style={{ padding: '0.75rem 1rem' }}>MAIL</th>
              <th style={{ padding: '0.75rem 1rem' }}>NACIMIENTO</th>
              <th style={{ padding: '0.75rem 1rem' }}>TELÉFONO</th>
              <th style={{ padding: '0.75rem 1rem' }}>PROFESIONAL</th>
              <th style={{ padding: '0.75rem 1rem' }}>ESTUDIO</th>
              <th style={{ padding: '0.75rem 1rem' }}>OBRA SOCIAL</th>
              <th style={{ padding: '0.75rem 1rem' }}>COSEGURO</th>
              <th style={{ padding: '0.75rem 1rem' }}>PARTICULAR</th>
              <th style={{ padding: '0.75rem 1rem' }}>PAGO</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', position: 'sticky', right: 0, background: 'var(--table-sticky-bg, #ffffff)', color: 'var(--table-sticky-text, #000000)', zIndex: 31, borderLeft: '1px solid var(--glass-border)', borderBottom: '2px solid var(--glass-border)' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {ingresos.map((ing) => {
              const currentDate = format(new Date(ing.appointment_date), "dd/MM/yyyy");
              const showDate = currentDate !== lastDate;
              lastDate = currentDate;
              const isTodayRow = isToday(new Date(ing.appointment_date));
              const isChecked = optimisticChecks[ing.id] ?? ing.checkbox_checked;

              return (
                <tr 
                  key={ing.id} 
                  ref={isTodayRow ? todayRef : null}
                  style={{ 
                    borderBottom: '1px solid var(--glass-border)', 
                    background: isTodayRow ? 'rgba(14, 165, 233, 0.15)' : (isChecked ? 'rgba(16, 185, 129, 0.1)' : 'transparent'),
                    transition: 'all 0.2s'
                  }}
                >
                  <td style={{ 
                    padding: '0.75rem 1rem', 
                    fontWeight: 700, 
                    position: 'sticky', 
                    left: 0, 
                    background: 'var(--table-sticky-bg, #ffffff)',
                    color: 'var(--table-sticky-text, #000000)',
                    zIndex: 2,
                    borderBottom: '1px solid var(--glass-border)'
                  }}>
                    {showDate ? currentDate : ""}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {ing.result_date ? format(new Date(ing.result_date), "dd/MM") : '-'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <select
                      value={ing.biochemical_notice || ''}
                      onChange={async (e) => {
                        const val = e.target.value;
                        await updateBiochemicalNotice(ing.id, val);
                      }}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        outline: 'none',
                        width: '130px',
                        background: ing.biochemical_notice === 'LISTO P/ ENVIAR' ? '#dcfce7' : (ing.biochemical_notice === 'RTO PARCIALES' ? '#ffedd5' : 'var(--glass-bg)'),
                        color: ing.biochemical_notice === 'LISTO P/ ENVIAR' ? '#166534' : (ing.biochemical_notice === 'RTO PARCIALES' ? '#9a3412' : 'var(--text-main)'),
                      }}
                    >
                      <option value="">-</option>
                      <option value="LISTO P/ ENVIAR" style={{ background: '#dcfce7', color: '#166534' }}>LISTO P/ ENVIAR</option>
                      <option value="RTO PARCIALES" style={{ background: '#ffedd5', color: '#9a3412' }}>RTO PARCIALES</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', position: 'relative' }}>
                    {/* Notification Bell */}
                    <div 
                      onClick={() => setBellPopup({ id: ing.id, note: ing.internal_note || '', status: ing.internal_note_status || 'none' })}
                      style={{ 
                        position: 'absolute', top: '4px', right: '4px', cursor: 'pointer',
                        color: ing.internal_note_status === 'unread' ? '#F59E0B' : (ing.internal_note_status === 'read' ? '#10B981' : '#94a3b8'),
                        transition: 'all 0.2s',
                        zIndex: 5
                      }}
                      title="Nota Interna"
                    >
                      <Bell size={12} fill={ing.internal_note_status !== 'none' ? 'currentColor' : 'none'} />
                    </div>

                    <button 
                      onClick={() => handleToggleCheck(ing.id, isChecked)}
                      style={{ 
                        width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--glass-border)',
                        background: isChecked ? 'var(--success)' : 'transparent',
                        borderColor: isChecked ? 'var(--success)' : 'var(--glass-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        color: 'white',
                        margin: '0 auto'
                      }}
                    >
                      {isChecked && <Check size={14} strokeWidth={3} />}
                    </button>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <EditableCell id={ing.id} field="report_id" value={ing.report_id} />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {ing.name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {ing.dni}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {ing.address || '-'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {ing.email || '-'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {ing.birth_date ? format(new Date(ing.birth_date), "dd/MM/yyyy") : '-'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {ing.phone || '-'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-main)' }}>
                    <EditableCell id={ing.id} field="professional_name" value={ing.professional_name} />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>
                    {ing.analyses && ing.analyses.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {ing.analyses.filter((a: any) => a.name).map((a: any, idx: number) => (
                          <div key={idx} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                             <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                             {a.name}{a.subtype ? ` (${a.subtype})` : ''}
                          </div>
                        ))}
                      </div>
                    ) : (
                      ing.analysis_type
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>
                      {ing.health_insurance || 'PARTICULAR'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--success)' }}>
                    <EditableCell id={ing.id} field="coseguro" value={ing.coseguro} type="number" />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    <EditableCell id={ing.id} field="particular_price" value={ing.particular_price} type="number" />
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <EditableCell 
                      id={ing.id} 
                      field="payment_method" 
                      value={ing.payment_method} 
                      type="select" 
                      options={['-', 'EFECTIVO', 'TRANSFERENCIA', 'TARJETA']} 
                    />
                  </td>
                  <td style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'right', 
                    position: 'sticky', 
                    right: 0, 
                    background: 'var(--table-sticky-bg, #ffffff)',
                    color: 'var(--table-sticky-text, #000000)',
                    zIndex: 2,
                    borderLeft: '1px solid var(--glass-border)',
                    borderBottom: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => onEdit(ing)}
                        style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: 'none', cursor: 'pointer' }}
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(ing.id)}
                        style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', cursor: 'pointer' }}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {bellPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                <Bell size={24} color={bellPopup.status === 'unread' ? '#F59E0B' : (bellPopup.status === 'read' ? '#10B981' : 'var(--primary)')} /> 
                NOTA INTERNA
              </h3>
              <button onClick={() => setBellPopup(null)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={20} />
              </button>
            </div>
            
            <textarea 
              value={bellPopup.note}
              onChange={(e) => setBellPopup({ ...bellPopup, note: e.target.value })}
              placeholder="Escribe una nota interna para el equipo..."
              style={{ 
                width: '100%', minHeight: '150px', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--glass-border)', 
                background: 'var(--glass-bg)', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600, outline: 'none',
                resize: 'none', lineHeight: 1.6
              }}
            />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button 
                 onClick={async () => {
                   setLoadingId(bellPopup.id);
                   try {
                     const res = await updateInternalNote(bellPopup.id, bellPopup.note);
                     if (res.success) {
                       setBellPopup(null);
                       onRefresh();
                     }
                   } catch (e: any) {
                     console.error("Connection error:", e);
                   }
                   setLoadingId(null);
                 }}
                 className="btn-primary" 
                 style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', fontWeight: 800 }}
               >
                 {loadingId === bellPopup.id ? 'GUARDANDO...' : 'GUARDAR NOTA'}
               </button>
               {bellPopup.status === 'unread' && (
                 <button 
                   onClick={async () => {
                     setLoadingId(bellPopup.id);
                     try {
                       const res = await markInternalNoteAsRead(bellPopup.id);
                       if (res.success) {
                         setBellPopup(null);
                         onRefresh();
                       }
                     } catch (e: any) {
                       console.error("Connection error:", e);
                     }
                     setLoadingId(null);
                   }}
                   style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', background: '#10B981', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}
                 >
                   {loadingId === bellPopup.id ? '...' : 'MARCAR LEÍDO'}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
