"use client";

import { useState, useEffect } from "react";
import { Search, User, Calendar, FileText, Plus, Send, CheckCircle, Clock, Trash2, Eye, Download, MessageSquare } from "lucide-react";
import { searchPatients, getPatientAppointments, uploadMedicalResult } from "@/actions/medical_results";
import Portal from "./Portal";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function MedicalResultsManager({ currentUser }: { currentUser: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  // Modal Step 1: History, Step 2: Upload
  const [modalStep, setModalStep] = useState(1);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch();
      } else {
        setPatients([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  async function handleSearch() {
    setLoading(true);
    const res = await searchPatients(searchQuery);
    if (res.data) setPatients(res.data);
    setLoading(false);
  }

  async function handleSelectPatient(patient: any) {
    setSelectedPatient(patient);
    setLoading(true);
    const res = await getPatientAppointments(patient.id);
    if (res.data) setAppointments(res.data);
    setLoading(false);
    setModalStep(1);
    setIsModalOpen(true);
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("appointment_id", selectedApt.id);
    formData.append("patient_id", selectedPatient.id);
    
    const res = await uploadMedicalResult(formData);
    if (res.success) {
      alert("Resultado cargado con éxito");
      setIsModalOpen(false);
      setSelectedApt(null);
    } else {
      alert("Error: " + res.error);
    }
    setUploading(false);
  }

  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid var(--glass-border)",
    background: "var(--glass-bg)",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.2s"
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={20} />
        <input 
          type="text" 
          placeholder="Buscar paciente por nombre o DNI..." 
          style={{ ...inputStyle, paddingLeft: '3rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {patients.map(p => (
          <div 
            key={p.id} 
            className="hoverable-card" 
            onClick={() => handleSelectPatient(p)}
            style={{ 
              padding: '1.5rem', 
              background: 'white', 
              borderRadius: '16px', 
              border: '1px solid var(--glass-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '12px' }}>
              <User color="var(--primary)" size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{p.name}</h4>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DNI: {p.dni}</p>
            </div>
          </div>
        ))}
        {loading && <p>Buscando...</p>}
        {!loading && searchQuery.length > 2 && patients.length === 0 && <p>No se encontraron pacientes.</p>}
      </div>

      {isModalOpen && (
        <Portal>
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "1rem"
          }}>
            <div style={{ 
              width: "100%", maxWidth: "600px", maxHeight: "90vh",
              background: "white", borderRadius: "20px", overflow: "hidden",
              display: "flex", flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
            }}>
              <div style={{ padding: "1.5rem", borderBottom: "1px solid #f1f5f9", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {modalStep === 1 ? <HistoryIcon /> : <FilePlusIcon />}
                  {modalStep === 1 ? `Historial de ${selectedPatient?.name}` : `Cargar Resultado Médico`}
                </h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
                  <XIcon />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {modalStep === 1 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Seleccioná el turno al que querés asignar el resultado:</p>
                      {appointments.map(apt => (
                        <div 
                          key={apt.id} 
                          style={{ 
                            padding: '1.2rem', border: '1px solid #e2e8f0', borderRadius: '16px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            transition: 'all 0.2s', background: 'white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{format(new Date(apt.appointment_date), "EEEE d 'de' MMMM, yyyy", { locale: es })}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                              <Clock size={14} /> {format(new Date(apt.appointment_date), "HH:mm")} hs — {apt.analysis_type}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => { setSelectedApt(apt); setModalStep(2); }}
                              style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: 'var(--primary)', color: 'white', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <Plus size={16} /> Cargar Resultado
                            </button>
                            <button 
                              onClick={() => {
                                const msg = `Hola ${selectedPatient.name}, tu resultado médico del día ${format(new Date(apt.appointment_date), "dd/MM")} ya está disponible en: https://legalaboratorio.vercel.app/resultado`;
                                window.open(`https://wa.me/${selectedPatient.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              style={{ padding: '0.5rem', borderRadius: '10px', background: '#25D366', color: 'white', display: 'flex', alignItems: 'center' }}
                              title="Avisar por WhatsApp"
                            >
                              <MessageSquare size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {appointments.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                          <Calendar size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                          <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>No hay turnos registrados</p>
                        </div>
                      )}
                    </div>
                ) : (
                  <form id="upload-form" onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>TURNO SELECCIONADO</p>
                      <p style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>{format(new Date(selectedApt.appointment_date), "dd/MM/yyyy")} - {selectedApt.analysis_type}</p>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tipo de Resultado</label>
                      <select name="type" required style={inputStyle}>
                        <option value="pdf">Documento PDF</option>
                        <option value="image">Imagen / Foto</option>
                        <option value="note">Nota Escrita</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Contenido / Archivos</label>
                      <input name="files" type="file" multiple style={inputStyle} />
                      <textarea name="note_content" placeholder="Escribí aquí si seleccionaste 'Nota Escrita'..." style={{ ...inputStyle, marginTop: '1rem', minHeight: '100px', resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setModalStep(1)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Atrás</button>
                      <button type="submit" disabled={uploading} style={{ flex: 2, padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: uploading ? 'wait' : 'pointer' }}>
                        {uploading ? 'Cargando...' : 'Guardar Resultado'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}

      <style jsx>{`
        .hoverable-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          border-color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
}

const HistoryIcon = () => <Calendar size={20} color="var(--primary)" />;
const FilePlusIcon = () => <FileText size={20} color="var(--primary)" />;
const XIcon = () => <X size={20} />;
const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
