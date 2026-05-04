"use client";

import { useState, useEffect } from "react";
import { X, Save, User as UserIcon, Calendar, Phone, Mail, Shield, Search, CheckCircle, Clock, DollarSign, CreditCard, ChevronRight } from "lucide-react";
import { searchPatients } from "@/actions/medical_results";
import { getTodayAppointments } from "@/actions/appointments";
import { createIngreso, getNextReportId } from "@/actions/ingresos";

interface NewIngresoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingIngreso?: any;
}

export default function NewIngresoModal({ isOpen, onClose, editingIngreso }: NewIngresoModalProps) {
  const [analyses, setAnalyses] = useState<{name: string, subtype: string}[]>([{name: "", subtype: ""}]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nextReportId, setNextReportId] = useState("");
  
  // Con Turno Selection
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);
  
  // Autofill state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [mode, setMode] = useState<"sin_turno" | "con_turno">("sin_turno");

  useEffect(() => {
    if (editingIngreso) {
      setSelectedPatient(editingIngreso);
      setMode("sin_turno");
      if (editingIngreso.analyses && editingIngreso.analyses.length > 0) {
        setAnalyses(editingIngreso.analyses.map((a: any) => ({ name: a.name, subtype: a.subtype })));
      } else {
        setAnalyses([{ name: editingIngreso.analysis_type || "", subtype: editingIngreso.aire_test_type || "" }]);
      }
    } else {
      setSelectedPatient(null);
      setMode("sin_turno");
      setAnalyses([{ name: "", subtype: "" }]);
      if (isOpen) fetchNextId();
    }
  }, [editingIngreso, isOpen]);

  useEffect(() => {
    if (!editingIngreso && selectedPatient) {
        if (selectedPatient.analyses && selectedPatient.analyses.length > 0) {
            setAnalyses(selectedPatient.analyses.map((a: any) => ({ name: a.name, subtype: a.subtype })));
        } else {
            setAnalyses([{ name: selectedPatient.analysis_type || "", subtype: selectedPatient.aire_test_type || "" }]);
        }
    }
  }, [selectedPatient, editingIngreso]);

  async function fetchNextId() {
    const res = await getNextReportId();
    if (res.success && res.nextId) {
      setNextReportId(res.nextId);
    }
  }

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
                onClick={() => { setMode("sin_turno"); setSelectedPatient(null); }}
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
                onClick={() => { setMode("con_turno"); setSelectedPatient(null); }}
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
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>{apt.analysis_type} — DNI: {apt.dni}</div>
                        </div>
                        <ChevronRight size={20} color="var(--primary)" />
                      </div>
                    ))
                  )}
                  {todayAppointments.length === 0 && !loadingToday && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hay turnos agendados para hoy.</p>}
                </>
              ) : (
                <IngresoForm 
                  mode={mode}
                  nextReportId={nextReportId}
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
                  analyses={analyses}
                  setAnalyses={setAnalyses}
                />
              )}
            </div>
          ) : (
            <IngresoForm 
              mode={mode}
              nextReportId={nextReportId}
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
              analyses={analyses}
              setAnalyses={setAnalyses}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function IngresoForm({
  mode, nextReportId, selectedPatient, editingIngreso, setSelectedPatient, handleSubmit, loading, error, inputStyle, searchResults, searchQuery, setSearchQuery, autofillPatient, onClose, analyses, setAnalyses
}: any) {
  const addAnalysis = () => setAnalyses([...analyses, { name: "", subtype: "" }]);
  const removeAnalysis = (index: number) => setAnalyses(analyses.filter((_: any, i: number) => i !== index));
  const updateAnalysis = (index: number, field: string, value: string) => {
    const newAnalyses = [...analyses];
    newAnalyses[index] = { ...newAnalyses[index], [field]: value };
    setAnalyses(newAnalyses);
  };

  const defaultAppointmentDate = (() => {
    const src = editingIngreso || selectedPatient;
    if (src?.appointment_date) {
      return new Date(src.appointment_date).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  })();
  const [appointmentDate, setAppointmentDate] = useState(defaultAppointmentDate);

  return (
    <form 
      key={selectedPatient?.id || 'new'} 
      onSubmit={handleSubmit} 
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* existingId for the action should only be an APPOINTMENT id */}
      {editingIngreso && <input type="hidden" name="id" value={editingIngreso.id} />}
      {mode === 'con_turno' && selectedPatient?.id && !editingIngreso && <input type="hidden" name="id" value={selectedPatient.id} />}
      
      {error && <div style={{ color: 'var(--danger)', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Paciente</label>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o DNI para autocompletar..." 
              style={{ ...inputStyle, paddingLeft: '2.5rem' }} 
            />
            
            {searchResults.length > 0 && (
              <div style={{ 
                position: 'absolute', top: '100%', left: 0, right: 0, 
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '12px', marginTop: '0.5rem', zIndex: 100,
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden'
              }}>
                {searchResults.map((p: any) => (
                  <div 
                    key={p.id} 
                    onClick={() => autofillPatient(p)}
                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}
                    className="hoverable-row"
                  >
                    <span>{p.name}</span>
                    <span style={{ opacity: 0.5 }}>{p.dni}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Nombre Completo</label>
            <input name="name" required defaultValue={selectedPatient?.name} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>DNI</label>
            <input name="dni" required defaultValue={selectedPatient?.dni} style={inputStyle} />
          </div>
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
          <input name="email" type="text" defaultValue={selectedPatient?.email} style={inputStyle} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Dirección</label>
          <input name="address" defaultValue={selectedPatient?.address} style={inputStyle} />
        </div>

        <div style={{ gridColumn: 'span 2', height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }} />

        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Tipos de Estudios/Análisis</label>
            <button type="button" onClick={addAnalysis} style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(14, 165, 233, 0.1)', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>+ AGREGAR ESTUDIO</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analyses.map((a: any, index: number) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <input 
                        name="analysis_name" 
                        required 
                        list="analysis-list"
                        value={a.name}
                        onChange={(e) => updateAnalysis(index, 'name', e.target.value)}
                        placeholder="Seleccioná o escribí estudio..."
                        style={{ ...inputStyle, background: 'var(--glass-bg)' }} 
                    />
                    {a.name === 'Test de aire' && (
                        <select 
                            name="aire_test_subtype" 
                            required 
                            value={a.subtype}
                            onChange={(e) => updateAnalysis(index, 'subtype', e.target.value)}
                            style={{ ...inputStyle, marginTop: '0.4rem', background: 'var(--glass-bg)', color: 'var(--text-main)', fontSize: '0.8rem', padding: '0.4rem' }}
                        >
                            <option value="">-- Seleccionar Prueba --</option>
                            <option value="SIBO">SIBO</option>
                            <option value="SIBO c/Lactulon">SIBO c/Lactulon</option>
                            <option value="Lactosa">Lactosa</option>
                            <option value="Fructuosa">Fructuosa</option>
                        </select>
                    )}
                    {/* Fallback for legacy subtype if not explicitly using aire_test_subtype name in some forms */}
                    {a.name !== 'Test de aire' && <input type="hidden" name="aire_test_subtype" value="" />}
                </div>
                {analyses.length > 1 && (
                  <button type="button" onClick={() => removeAnalysis(index)} style={{ padding: '0.5rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                )}
              </div>
            ))}
          </div>
          <datalist id="analysis-list">
            {['Test de aire', 'SIBO', 'LACTOSA', 'FRUCTUOSA', 'PYLORI', 'EXTRACCION', 'MATERIA FECAL', 'ORINA', 'PANEL 105', 'PANEL 63', 'ALCAT', 'CIBIC'].map(opt => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Obra Social</label>
          <input 
            name="health_insurance" 
            list="insurance-list"
            defaultValue={selectedPatient?.health_insurance || 'Particular'} 
            placeholder="Seleccioná o escribí obra social..."
            style={{ ...inputStyle, background: 'var(--glass-bg)' }} 
          />
          <datalist id="insurance-list">
            {['Particular', 'A.A.T.R.A. - OSTYR - (SCIS S.A. )', 'A.M.U.R.', 'A.P.M.', 'APROSS', 'AVALIAN', 'CAJA DE ABOGADOS', 'CAJA NOTARIAL', 'CEA - SAN PEDRO', 'CIENCIAS ECONOMICAS', 'COBERTURA DE SALUD S.A. (BOREAL)', 'D.A.S.P.U.', 'DA.SU.Te.N', 'FEDERADA SALUD', 'GRUPO PREMEDIC', 'IOSFA', 'JERARQUICOS SALUD', 'LUIS PASTEUR', 'O.P.D.E.A.', 'O.S.P.E.R.Y.H.R.A.', 'O.S.P.I.A.', 'O.S.P.I.G.P.C.', 'OBRA SOCIAL PERSONAL DE FARMACIA (O.S.P.F.)', 'OSADEF', 'OSFFENTOS', 'OSMISS', 'OSPACA', 'OSPCRA', 'OSPECOR', 'OSPEP', 'OSPICAL ENSALUD', 'OSPIHMP', 'OSPIM', 'OSPJTAP', 'OSPL', 'OSSACRA AMA SALUD', 'OSTEL', 'PAMI', 'PODER JUDICIAL', 'PREVENCION SALUD', 'S.A.D.A.I.C.', 'S.A.P.', 'SANCOR SALUD', 'SUPERINTEND.DE BIENESTAR POLICIA FEDERAL ARG.', 'UNION PERSONAL', 'VETERANOS DE GUERRA', 'Osde', 'Swiss medical', 'Medife', 'Galeno', 'Derivacion', 'ALCAT', 'CIBIC', 'Metabolomica', 'Jujuy', 'Rio 1°'].map(opt => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </div>
        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Fecha de Ingreso</label>
            <input
              name="appointment_date"
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>N° INFORME</label>
            <input
              name="report_id"
              key={selectedPatient?.report_id || nextReportId}
              defaultValue={selectedPatient?.report_id || nextReportId}
              style={inputStyle}
              placeholder="Ej: 94113"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Fecha de Resultado</label>
            <input name="result_date" type="date" defaultValue={selectedPatient?.result_date ? new Date(selectedPatient.result_date).toISOString().split('T')[0] : ''} style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Profesional</label>
          <input name="professional_name" defaultValue={selectedPatient?.professional_name} style={inputStyle} placeholder="Nombre del médico" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Medio de Pago</label>
          <select name="payment_method" defaultValue={selectedPatient?.payment_method || 'EFECTIVO'} style={{ ...inputStyle, background: 'var(--glass-bg)', color: 'var(--text-main)' }}>
            <option value="-" style={{ background: 'var(--glass-bg)', color: 'var(--text-main)' }}>-</option>
            <option value="EFECTIVO" style={{ background: 'var(--glass-bg)', color: 'var(--text-main)' }}>Efectivo</option>
            <option value="TRANSFERENCIA" style={{ background: 'var(--glass-bg)', color: 'var(--text-main)' }}>Transferencia</option>
            <option value="TARJETA" style={{ background: 'var(--glass-bg)', color: 'var(--text-main)' }}>Tarjeta</option>
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
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Observaciones / Detalles</label>
          <textarea 
            name="observations" 
            defaultValue={selectedPatient?.observations} 
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} 
            placeholder="Algún detalle adicional sobre el paciente o el estudio..."
          />
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
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Subir Pedidos Médicos</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hacé clic aquí para seleccionar uno o varios archivos (PDF/Imagen)</div>
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
