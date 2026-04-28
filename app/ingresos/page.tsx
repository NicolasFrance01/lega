"use client";

import { useState, useEffect } from "react";
import { getIngresos } from "@/actions/ingresos";
import IngresosTable from "@/components/IngresosTable";
import NewIngresoModal from "@/components/NewIngresoModal";
import { Plus, Calendar, Filter, Download, Activity, Clock, FileText, X, Car, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngreso, setEditingIngreso] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await getIngresos();
    if (res.data) setIngresos(res.data);
    setLoading(false);
  }

  function handleEdit(ingreso: any) {
    setEditingIngreso(ingreso);
    setIsModalOpen(true);
  }

  // Filter logic across all columns
  const filteredIngresos = ingresos.filter(ing => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      ing.name?.toLowerCase().includes(s) ||
      ing.dni?.toLowerCase().includes(s) ||
      ing.report_id?.toLowerCase().includes(s) ||
      ing.analysis_type?.toLowerCase().includes(s) ||
      ing.professional_name?.toLowerCase().includes(s) ||
      ing.health_insurance?.toLowerCase().includes(s) ||
      ing.address?.toLowerCase().includes(s) ||
      ing.email?.toLowerCase().includes(s) ||
      ing.payment_method?.toLowerCase().includes(s) ||
      format(new Date(ing.appointment_date), 'dd/MM/yyyy').includes(s)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Ingresos</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Registro histórico y detallado de entrada de pacientes y cobros.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem', borderRadius: '14px', fontSize: '1rem' }}
          >
            <Plus size={22} /> NUEVO INGRESO
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
          <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, DNI, informe, estudio, obra social..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)', fontWeight: 600, fontSize: '0.95rem', outline: 'none', color: 'var(--text-main)'
            }}
          />
        </div>
        
        <button 
          onClick={fetchData}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
            borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
            fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)', cursor: 'pointer'
          }}
        >
          <Activity size={18} /> Actualizar
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="animate-spin" style={{ marginBottom: '1rem' }}><Activity size={40} /></div>
          Cargando ingresos históricos...
        </div>
      ) : (
        <IngresosTable ingresos={filteredIngresos} onEdit={handleEdit} period="all" />
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
