"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Edit2, Trash2, Search, Filter, Calendar as CalendarIcon, Clock, User, Shield, CreditCard, DollarSign, Mail, MapPin } from "lucide-react";
import { updateIngresoField, deleteIngreso } from "@/actions/ingresos";

export default function IngresosTable({ ingresos, onEdit }: { ingresos: any[], onEdit: (ingreso: any) => void }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

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

  if (!ingresos || ingresos.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>No hay ingresos registrados en este periodo.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '0.75rem 1rem' }}>FECHA</th>
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
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {ingresos.map((ing) => (
              <tr key={ing.id} style={{ borderBottom: '1px solid #f1f5f9', background: ing.checkbox_checked ? '#f0fdf4' : 'transparent' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                  {format(new Date(ing.appointment_date), "dd/MM/yyyy")}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {ing.result_date ? format(new Date(ing.result_date), "dd/MM") : '-'}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleToggleCheck(ing.id, ing.checkbox_checked)}
                    style={{ 
                      width: '20px', height: '20px', borderRadius: '4px', border: '2px solid #cbd5e1',
                      background: ing.checkbox_checked ? 'var(--success)' : 'white',
                      borderColor: ing.checkbox_checked ? 'var(--success)' : '#cbd5e1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      color: 'white'
                    }}
                  >
                    {ing.checkbox_checked && <Check size={14} strokeWidth={3} />}
                  </button>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 500 }}>
                  {ing.report_id || '-'}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
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
                <td style={{ padding: '0.75rem 1rem' }}>
                  {ing.professional_name || '-'}
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
                  {ing.coseguro ? `$${ing.coseguro}` : '-'}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                  {ing.particular_price ? `$${ing.particular_price}` : '-'}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>
                    {ing.payment_method || '-'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
