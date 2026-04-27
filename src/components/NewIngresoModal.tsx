"use client";

import { useState, useEffect } from "react";
import { X, Save, User as UserIcon, Calendar, Phone, Mail, Shield, Search, CheckCircle, Clock, DollarSign, CreditCard, ChevronRight } from "lucide-react";
import { searchPatients } from "@/actions/medical_results";
import { getTodayAppointments } from "@/actions/appointments";
import { createIngreso } from "@/actions/ingresos";

interface NewIngresoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewIngresoModal({ isOpen, onClose }: NewIngresoModalProps) {
  const [mode, setMode] = useState<"sin_turno" | "con_turno">("sin_turno");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Con Turno Selection
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);
  
  // Autofill state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    if (isOpen && mode === "con_turno") {
      fetchToday();
    }
  }, [isOpen, mode]);

  async function fetchToday() {
    setLoadingToday(true);
    const res = await getTodayAppointments();
    if (res.data) setTodayAppointments(res.data);
    setLoadingToday(false);
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        handlePatientSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  async function handlePatientSearch() {
    const res = await searchPatients(searchQuery);
    if (res.data) setSearchResults(res.data);
  }

  function autofillPatient(patient: any) {
    setSelectedPatient(patient);
    setSearchQuery("");
    setSearchResults([]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      const res = await createIngreso(formData);
      if (res.error) {
        setError(res.error);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar ingreso");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1px solid var(--glass-border)",
    background: "var(--glass-bg)",
    fontSize: "0.9rem",
    outline: "none"
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '1rem', animation: 'fadeIn 0.2s ease'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '700px', maxHeight: '90vh', background: 'white',
        overflowY: 'auto', position: 'relative', borderRadius: '20px'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>Nuevo Ingreso</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Registrá la entrada de un paciente al laboratorio</p>
          </div>
          <button onClick={onClose} style={{ color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              onClick={() => setMode("sin_turno")}
              style={{ 
                flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 700,
                background: mode === 'sin_turno' ? 'var(--primary)' : '#f8fafc',
                color: mode === 'sin_turno' ? 'white' : '#64748b',
                border: mode === 'sin_turno' ? 'none' : '1px solid #e2e8f0',
                transition: 'all 0.2s'
              }}
            >
              SIN TURNO (Manual)
            </button>
            <button 
              onClick={() => setMode("con_turno")}
              style={{ 
                flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 700,
                background: mode === 'con_turno' ? 'var(--primary)' : '#f8fafc',
                color: mode === 'con_turno' ? 'white' : '#64748b',
                border: mode === 'con_turno' ? 'none' : '1px solid #e2e8f0',
                transition: 'all 0.2s'
              }}
            >
              CON TURNO (Agendados Hoy)
            </button>
          </div>

          {mode === "con_turno" ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#64748b' }}>Seleccioná el turno de hoy:</h4>
              {loadingToday ? <p>Cargando turnos...</p> : (
                todayAppointments.map(apt => (
                  <div 
                    key={apt.id} 
                    onClick={() => {
                      setSelectedPatient(apt);
                      setMode("sin_turno");
                    }}
                    style={{ 
                      padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{apt.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{apt.analysis_type} — {apt.dni}</div>
                    </div>
                    <ChevronRight size={20} color="var(--primary)" />
                  </div>
                ))
              )}
              {todayAppointments.length === 0 && !loadingToday && <p>No hay turnos agendados para hoy.</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {error && <div style={{ color: 'var(--danger)', padding: '0.75rem', background: '#fef2f2', borderRadius: '8px', fontSize: '0.85rem' }}>{error}</div>}

              {/* Patient Search / Autofill */}
              {!selectedPatient && (
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '1.2rem', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Buscá por nombre o DNI para autocompletar..." 
                    className="input-field" 
                    style={{ paddingLeft: '2.5rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <div style={{ 
                      position: 'absolute', top: '100%', left: 0, right: 0, 
                      background: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      zIndex: 20, marginTop: '0.5rem', border: '1px solid #e2e8f0'
                    }}>
                      {searchResults.map(p => (
                        <div key={p.id} onClick={() => autofillPatient(p)} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>DNI: {p.dni} — {p.health_insurance}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPatient && (
                <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#0369a1' }}>PACIENTE SELECCIONADO</p>
                    <p style={{ margin: 0, fontWeight: 700 }}>{selectedPatient.name} ({selectedPatient.dni})</p>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 600 }}>Cambiar</button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Nombre Completo</label>
                  <input name="name" required defaultValue={selectedPatient?.name} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>DNI</label>
                  <input name="dni" required defaultValue={selectedPatient?.dni} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Nacimiento</label>
                  <input name="birth_date" type="date" defaultValue={selectedPatient?.birth_date ? new Date(selectedPatient.birth_date).toISOString().split('T')[0] : ''} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Teléfono</label>
                  <input name="phone" defaultValue={selectedPatient?.phone} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Email</label>
                  <input name="email" type="email" defaultValue={selectedPatient?.email} style={inputStyle} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Dirección</label>
                  <input name="address" defaultValue={selectedPatient?.address} style={inputStyle} />
                </div>

                <div style={{ gridColumn: 'span 2', height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }} />

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Tipo de Estudio/Análisis</label>
                  <input name="analysis_type" required defaultValue={selectedPatient?.analysis_type} style={inputStyle} placeholder="Ej: EXTRACCION" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Obra Social</label>
                  <input name="health_insurance" defaultValue={selectedPatient?.health_insurance} style={inputStyle} placeholder="Ej: PAMI" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>N° Informe</label>
                  <input name="report_id" style={inputStyle} placeholder="Ej: 94113" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Fecha de Resultado</label>
                  <input name="result_date" type="date" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Profesional</label>
                  <input name="professional_name" style={inputStyle} placeholder="Nombre del médico" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Medio de Pago</label>
                  <select name="payment_method" style={inputStyle}>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="COSEGURO">Coseguro</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Coseguro O.Soc</label>
                  <input name="coseguro" type="number" step="0.01" style={inputStyle} placeholder="$ 0.00" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>Particular</label>
                  <input name="particular_price" type="number" step="0.01" style={inputStyle} placeholder="$ 0.00" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#f1f5f9', fontWeight: 700 }}>Cancelar</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 700 }}>
                  {loading ? 'Cargando...' : 'Confirmar Ingreso'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
