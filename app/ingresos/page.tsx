"use client";

import { useState, useEffect } from "react";
import { getIngresos } from "@/actions/ingresos";
import IngresosTable from "@/components/IngresosTable";
import NewIngresoModal from "@/components/NewIngresoModal";
import { Plus, Calendar, Filter, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function IngresosPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngreso, setEditingIngreso] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period, selectedDate]);

  async function fetchData() {
    setLoading(true);
    const res = await getIngresos(period, selectedDate);
    if (res.data) setIngresos(res.data);
    setLoading(false);
  }

  function handleEdit(ingreso: any) {
    setEditingIngreso(ingreso);
    setIsModalOpen(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Ingresos</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Registro detallado de entrada de pacientes y cobros.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem', borderRadius: '14px', fontSize: '1rem' }}
        >
          <Plus size={22} /> NUEVO INGRESO
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '12px' }}>
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700,
                background: period === p ? 'white' : 'transparent',
                color: period === p ? 'var(--primary)' : '#64748b',
                boxShadow: period === p ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {p === 'day' ? 'Día' : p === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ 
                padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1px solid var(--glass-border)',
                background: 'white', fontWeight: 600, fontSize: '0.95rem', outline: 'none'
              }}
            />
          </div>
          <button 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'white',
              fontWeight: 700, fontSize: '0.9rem', color: '#64748b'
            }}
          >
            <Download size={18} /> Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>Cargando ingresos...</div>
      ) : (
        <IngresosTable ingresos={ingresos} onEdit={handleEdit} />
      )}

      <NewIngresoModal 
        isOpen={isModalOpen} 
        editingIngreso={editingIngreso}
        onClose={() => { 
          setIsModalOpen(false); 
          setEditingIngreso(null);
          fetchData(); 
        }} 
      />
    </div>
  );
}
