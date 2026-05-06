"use client";

import { useState } from "react";
import { History, CalendarPlus, UserCog, Trash2 } from "lucide-react";
import AppointmentModal from "./AppointmentModal";
import EditPatientModal from "./EditPatientModal";
import { deletePatient } from "@/actions/patients";

export default function PatientTableActions({ patient, userRole }: { patient: any, userRole?: string }) {
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isBioq = userRole === 'bioquimico';
  const canDelete = userRole === 'admin' || userRole === 'gerente';

  async function handleDelete() {
    if (!confirm(`¿Eliminar al paciente "${patient.name}"? Esta acción no se puede deshacer y borrará todos sus turnos e historial.`)) return;
    const res = await deletePatient(patient.id);
    if (res.error) alert("Error al eliminar: " + res.error);
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      <a 
        href={`/pacientes/${patient.id}`} 
        className="btn-secondary" 
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem', 
          padding: '0.4rem 0.8rem', background: 'rgba(14, 165, 233, 0.05)', 
          color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', 
          borderRadius: '6px', transition: 'all 0.2s', textDecoration: 'none',
          border: '1px solid rgba(14, 165, 233, 0.2)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.05)'}
      >
        <History size={14} /> Historial
      </a>

      <button 
        onClick={() => setIsEditModalOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem', 
          padding: '0.4rem 0.8rem', background: 'var(--glass-bg)', 
          color: 'var(--text-main)', fontWeight: 600, fontSize: '0.8rem', 
          borderRadius: '6px', transition: 'all 0.2s', border: '1px solid var(--glass-border)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
      >
        <UserCog size={14} color="var(--primary)" /> Editar
      </button>
      
      {!isBioq && (
        <button
          onClick={() => setIsAptModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 0.8rem', background: 'var(--primary)',
            color: 'white', fontWeight: 600, fontSize: '0.8rem',
            borderRadius: '6px', transition: 'all 0.2s', border: 'none',
            cursor: 'pointer', boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <CalendarPlus size={14} /> Reagendar
        </button>
      )}

      <AppointmentModal 
        key={patient.id + isAptModalOpen}
        isOpen={isAptModalOpen} 
        onClose={() => setIsAptModalOpen(false)} 
        initialData={{
          name: patient.name,
          dni: patient.dni,
          phone: patient.phone,
          health_insurance: patient.health_insurance
        }}
      />

      <EditPatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={patient}
      />

      {canDelete && (
        <button
          onClick={handleDelete}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.07)',
            color: 'var(--danger)', fontWeight: 600, fontSize: '0.8rem',
            borderRadius: '6px', transition: 'all 0.2s', border: '1px solid rgba(239,68,68,0.2)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
        >
          <Trash2 size={14} /> Eliminar
        </button>
      )}
    </div>
  );
}
