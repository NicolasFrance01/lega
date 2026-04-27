"use client";

import { useState, useEffect } from "react";
import { X, Save, User as UserIcon, Calendar, Phone, Mail, Shield, Search, CheckCircle, Clock, DollarSign, CreditCard, ChevronRight } from "lucide-react";
import { searchPatients } from "@/actions/medical_results";
import { getTodayAppointments } from "@/actions/appointments";
import { createIngreso } from "@/actions/ingresos";

interface NewIngresoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingIngreso?: any;
}

export default function NewIngresoModal({ isOpen, onClose, editingIngreso }: NewIngresoModalProps) {
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
    if (editingIngreso) {
      setSelectedPatient(editingIngreso);
      setMode("sin_turno");
    } else {
      setSelectedPatient(null);
      setMode("sin_turno");
    }
  }, [editingIngreso, isOpen]);

  useEffect(() => {
    if (isOpen && mode === "con_turno" && !editingIngreso) {
      fetchToday();
    }
  }, [isOpen, mode, editingIngreso]);

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
    background: 'var(--input-bg, rgba(255, 255, 255, 0.05))',
    color: 'var(--text-main)',
    fontSize: "0.9rem",
    outline: "none",
    transition: 'all 0.2s'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '1rem', animation: 'fadeIn 0.2s ease'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '750px', maxHeight: '92vh', background: 'var(--glass-bg)',
        overflowY: 'auto', position: 'relative', borderRadius: '24px', border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--glass-bg)', zIndex: 10, backdropFilter: 'blur(10px)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
              {editingIngreso ? 'Editar Ingreso' : 'Nuevo Ingreso'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              {editingIngreso ? 'Modificá los datos del ingreso' : 'Registrá la entrada de un paciente al laboratorio'}
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Mode Switcher */}
          {!editingIngreso && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button 
                onClick={() => setMode("sin_turno")}
                style={{ 
                  flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 700,
                  background: mode === 'sin_turno' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: mode === 'sin_turno' ? 'white' : 'var(--text-muted)',
                  border: mode === 'sin_turno' ? 'none' : '1px solid var(--glass-border)',
                  transition: 'all 0.2s'
                }}
              >
                SIN TURNO (Manual)
              </button>
              <button 
                onClick={() => setMode("con_turno")}
                style={{ 
                  flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 700,
                  background: mode === 'con_turno' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: mode === 'con_turno' ? 'white' : 'var(--text-muted)',
                  border: mode === 'con_turno' ? 'none' : '1px solid var(--glass-border)',
                  transition: 'all 0.2s'
                }}
              >
                CON TURNO (Agendados Hoy)
              </button>
            </div>
          )}

          {mode === "con_turno" && !editingIngreso ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!selectedPatient ? (
                <>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Seleccioná el turno de hoy:</h4>
                  {loadingToday ? <p style={{ color: 'var(--text-muted)' }}>Cargando turnos...</p> : (
                    todayAppointments.map(apt => (
                      <div 
                        key={apt.id} 
                        onClick={() => setSelectedPatient(apt)}
                        style={{ 
                          padding: '1.25rem', border: '1px solid var(--glass-border)', borderRadius: '16px',
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      >
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{apt.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{apt.analysis_type} — DNI: {apt.dni}</div>
                        </div>
                        <ChevronRight size={20} color="var(--primary)" />
                      </div>
                    ))
                  )}
                  {todayAppointments.length === 0 && !loadingToday && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hay turnos agendados para hoy.</p>}
                </>
              ) : (
                <IngresoForm 
                  selectedPatient={selectedPatient} 
                  editingIngreso={editingIngreso} 
                  setSelectedPatient={setSelectedPatient} 
                  handleSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                  inputStyle={inputStyle}
                  searchResults={searchResults}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  autofillPatient={autofillPatient}
                  onClose={onClose}
                />
              )}
            </div>
          ) : (
            <IngresoForm 
              selectedPatient={selectedPatient} 
              editingIngreso={editingIngreso} 
              setSelectedPatient={setSelectedPatient} 
              handleSubmit={handleSubmit}
              loading={loading}
              error={error}
              inputStyle={inputStyle}
              searchResults={searchResults}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              autofillPatient={autofillPatient}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function IngresoForm({ 
  selectedPatient, editingIngreso, setSelectedPatient, handleSubmit, loading, error, inputStyle, searchResults, searchQuery, setSearchQuery, autofillPatient, onClose 
}: any) {
  return (
    <form 
      key={selectedPatient?.id || 'new'} 
      onSubmit={handleSubmit} 
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {editingIngreso && <input type="hidden" name="id" value={editingIngreso.id} />}
      {selectedPatient?.id && !editingIngreso && <input type="hidden" name="id" value={selectedPatient.id} />}
      
      {error && <div style={{ color: 'var(--danger)', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

      {/* Patient Search / Autofill */}
      {!selectedPatient && !editingIngreso && (
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '1.2rem', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Buscá por nombre o DNI para autocompletar..." 
            style={{ ...inputStyle, paddingLeft: '2.5rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div style={{ 
              position: 'absolute', top: '100%', left: 0, right: 0, 
              background: 'var(--glass-bg)', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
              zIndex: 20, marginTop: '0.5rem', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)'
            }}>
              {searchResults.map((p: any) => (
                <div key={p.id} onClick={() => autofillPatient(p)} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DNI: {p.dni} — {p.health_insurance}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedPatient && (
        <div style={{ padding: '1rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '12px', border: '1px solid rgba(14, 165, 233, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>PACIENTE SELECCIONADO</p>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>{selectedPatient.name} ({selectedPatient.dni})</p>
          </div>
          {!editingIngreso && <button type="button" onClick={() => setSelectedPatient(null)} style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>Cambiar</button>}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Nombre Completo</label>
          <input name="name" required defaultValue={selectedPatient?.name} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>DNI</label>
          <input name="dni" required defaultValue={selectedPatient?.dni} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Nacimiento</label>
          <input name="birth_date" type="date" defaultValue={selectedPatient?.birth_date ? new Date(selectedPatient.birth_date).toISOString().split('T')[0] : ''} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Teléfono</label>
          <input name="phone" defaultValue={selectedPatient?.phone} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Email</label>
          <input name="email" type="email" defaultValue={selectedPatient?.email} style={inputStyle} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Dirección</label>
          <input name="address" defaultValue={selectedPatient?.address} style={inputStyle} />
        </div>

        <div style={{ gridColumn: 'span 2', height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }} />

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Tipo de Estudio/Análisis</label>
          <input name="analysis_type" required defaultValue={selectedPatient?.analysis_type} style={inputStyle} placeholder="Ej: EXTRACCION" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Obra Social</label>
          <input name="health_insurance" defaultValue={selectedPatient?.health_insurance} style={inputStyle} placeholder="Ej: PAMI" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>N° Informe</label>
          <input name="report_id" defaultValue={selectedPatient?.report_id} style={inputStyle} placeholder="Ej: 94113" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Fecha de Resultado</label>
          <input name="result_date" type="date" defaultValue={selectedPatient?.result_date ? new Date(selectedPatient.result_date).toISOString().split('T')[0] : ''} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Profesional</label>
          <input name="professional_name" defaultValue={selectedPatient?.professional_name} style={inputStyle} placeholder="Nombre del médico" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Medio de Pago</label>
          <select name="payment_method" defaultValue={selectedPatient?.payment_method || 'EFECTIVO'} style={{ ...inputStyle, background: 'var(--glass-bg)' }}>
            <option value="EFECTIVO" style={{ background: '#1e293b' }}>Efectivo</option>
            <option value="TRANSFERENCIA" style={{ background: '#1e293b' }}>Transferencia</option>
            <option value="TARJETA" style={{ background: '#1e293b' }}>Tarjeta</option>
            <option value="COSEGURO" style={{ background: '#1e293b' }}>Coseguro</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Coseguro O.Soc</label>
          <input name="coseguro" type="number" step="0.01" defaultValue={selectedPatient?.coseguro} style={inputStyle} placeholder="$ 0.00" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Particular</label>
          <input name="particular_price" type="number" step="0.01" defaultValue={selectedPatient?.particular_price} style={inputStyle} placeholder="$ 0.00" />
        </div>
        
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            Documentación Médica (Podés seleccionar varios)
          </label>
          <div 
            onClick={() => document.getElementById('file-upload')?.click()}
            style={{
              border: '2px dashed var(--primary)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              background: 'rgba(14, 165, 233, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.02)'}
          >
            <div style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Subir Pedidos Médicos</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Hacé clic aquí para seleccionar uno o varios archivos (PDF/Imagen)</div>
            <input 
              id="file-upload"
              name="document" 
              type="file" 
              multiple 
              accept="image/*,application/pdf" 
              style={{ display: 'none' }} 
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button type="button" onClick={onClose} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 700 }}>
          {loading ? 'Cargando...' : 'Confirmar Ingreso'}
        </button>
      </div>
    </form>
  );
}
