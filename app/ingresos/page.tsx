"use client";

import { useState, useEffect } from "react";
import { getIngresos } from "@/actions/ingresos";
import IngresosTable from "@/components/IngresosTable";
import NewIngresoModal from "@/components/NewIngresoModal";
import { Plus, Calendar, Filter, Download, Activity, Clock, FileText, X, Car, CheckCircle } from "lucide-react";
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

  // Calculate Stats
  const stats = {
    total: ingresos.length,
    confirmados: ingresos.filter(i => i.checkbox_checked).length,
    pendientes: ingresos.filter(i => !i.checkbox_checked).length,
    indicaciones: ingresos.filter(i => i.analysis_type?.toLowerCase().includes('aire')).length,
    cancelados: ingresos.filter(i => i.status === 'CANCELADO').length,
    domicilio: ingresos.filter(i => i.is_domicilio).length
  };

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

      {/* Stats Cards */}
      <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <Activity color="var(--primary)" size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Total General</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{stats.total}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <CheckCircle color="var(--success)" size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Confirmados</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{stats.confirmados}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <Clock color="#f59e0b" size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Pendientes</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{stats.pendientes}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <FileText color="#8b5cf6" size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Indicaciones</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{stats.indicaciones}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <X color="var(--danger)" size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Cancelados</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{stats.cancelados}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(100, 116, 139, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <Car color="#64748b" size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Domicilio</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{stats.domicilio}</h3>
          </div>
        </div>
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
