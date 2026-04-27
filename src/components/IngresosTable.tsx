"use client";

import { useState, useRef, useEffect } from "react";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Edit2, Trash2, Search, Filter, Calendar as CalendarIcon, Clock, User, Shield, CreditCard, DollarSign, Mail, MapPin, ArrowDown, ArrowUp } from "lucide-react";
import { updateIngresoField, deleteIngreso } from "@/actions/ingresos";

export default function IngresosTable({ ingresos, onEdit, period }: { ingresos: any[], onEdit: (ingreso: any) => void, period: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const todayRef = useRef<HTMLTableRowElement>(null);
  const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null);
  const [isAtToday, setIsAtToday] = useState(false);

  const handleJump = () => {
    if (!isAtToday) {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsAtToday(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsAtToday(false);
    }
  };

  // Auto-scroll removed as per request

  async function handleToggleCheck(id: string, current: boolean) {
    setLoadingId(id);
    const res = await updateIngresoField(id, 'checkbox_checked', !current);
    setLoadingId(null);
  }

  async function handleDelete(id: string) {
    if (confirm("¿Estás seguro de eliminar este ingreso?")) {
      await deleteIngreso(id);
    }
  }

  async function handleCellEdit(id: string, field: string, value: any) {
    await updateIngresoField(id, field, value);
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
            {options.map((opt: any) => <option key={opt} value={opt} style={{ background: '#1e293b', color: 'white' }}>{opt}</option>)}
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
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(248, 250, 252, 0.05)', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem 1rem', position: 'sticky', left: 0, background: '#ffffff', color: '#000000', zIndex: 10, borderBottom: '2px solid var(--glass-border)' }}>FECHA</th>
              <th style={{ padding: '0.75rem 1rem' }}>RESULTADO</th>
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
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', position: 'sticky', right: 0, background: '#ffffff', color: '#000000', zIndex: 10, borderLeft: '1px solid var(--glass-border)', borderBottom: '2px solid var(--glass-border)' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {ingresos.map((ing) => {
              const currentDate = format(new Date(ing.appointment_date), "dd/MM/yyyy");
              const showDate = currentDate !== lastDate;
              lastDate = currentDate;
              const isTodayRow = isToday(new Date(ing.appointment_date));

              return (
                <tr 
                  key={ing.id} 
                  ref={isTodayRow ? todayRef : null}
                  style={{ 
                    borderBottom: '1px solid var(--glass-border)', 
                    background: isTodayRow ? 'rgba(14, 165, 233, 0.15)' : (ing.checkbox_checked ? 'rgba(16, 185, 129, 0.1)' : 'transparent'),
                    transition: 'all 0.2s'
                  }}
                >
                  <td style={{ 
                    padding: '0.75rem 1rem', 
                    fontWeight: 700, 
                    position: 'sticky', 
                    left: 0, 
                    background: '#ffffff',
                    color: '#000000',
                    zIndex: 2,
                    borderBottom: '1px solid var(--glass-border)'
                  }}>
                    {showDate ? currentDate : ""}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {ing.result_date ? format(new Date(ing.result_date), "dd/MM") : '-'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleToggleCheck(ing.id, ing.checkbox_checked)}
                      style={{ 
                        width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--glass-border)',
                        background: ing.checkbox_checked ? 'var(--success)' : 'transparent',
                        borderColor: ing.checkbox_checked ? 'var(--success)' : 'var(--glass-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        color: 'white'
                      }}
                    >
                      {ing.checkbox_checked && <Check size={14} strokeWidth={3} />}
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
                    {ing.analysis_type}
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
                      options={['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'COSEGURO']} 
                    />
                  </td>
                  <td style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'right', 
                    position: 'sticky', 
                    right: 0, 
                    background: '#ffffff',
                    color: '#000000',
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
      
      {/* Scroll to Today floating button */}
      {period !== 'day' && (
        <div style={{ position: 'fixed', bottom: '3rem', right: '3rem', zIndex: 99999 }}>
          <button 
            onClick={handleJump}
            style={{ 
              background: 'var(--primary)', color: 'white',
              width: '80px', height: '80px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 40px -8px rgba(14, 165, 233, 0.5)', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer',
              gap: '2px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'scale(1)',
              padding: '10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(14, 165, 233, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 20px 40px -8px rgba(14, 165, 233, 0.5)';
            }}
            title={isAtToday ? "Ir al Inicio" : "Ir a Hoy"}
          >
            {isAtToday ? <ArrowUp size={28} strokeWidth={3} /> : <ArrowDown size={28} strokeWidth={3} />}
            <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>{isAtToday ? 'INICIO' : 'HOY'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
