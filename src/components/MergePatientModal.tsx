"use client";

import { useState } from "react";
import { searchPatients, mergePatients } from "@/actions/patients";
import { X, Search, AlertTriangle, ArrowRight } from "lucide-react";
import Portal from "./Portal";

export default function MergePatientModal({
  isOpen,
  onClose,
  patientToKeep,
}: {
  isOpen: boolean;
  onClose: () => void;
  patientToKeep: any;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [patientToMerge, setPatientToMerge] = useState<any | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  
  const [step, setStep] = useState<'search' | 'confirm' | 'result'>('search');
  const [resultMsg, setResultMsg] = useState('');
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchTerm || searchTerm.length < 2) return;
    setIsSearching(true);
    const res = await searchPatients(searchTerm);
    if (!res.error) {
      setSearchResults(res.data?.filter(p => p.id !== patientToKeep.id) || []);
    }
    setIsSearching(false);
  }

  function initiateMerge() {
    if (!patientToMerge) return;
    setStep('confirm');
  }

  async function handleMerge() {
    if (!patientToMerge) return;
    
    setIsMerging(true);
    const res = await mergePatients(patientToKeep.id, patientToMerge.id);
    setIsMerging(false);

    setStep('result');
    if (res.error) {
      setIsError(true);
      setResultMsg("Error al unificar: " + res.error);
    } else {
      setIsError(false);
      setResultMsg("Pacientes unificados exitosamente.");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    }
  }

  return (
    <Portal>
      <div className="modal-overlay" style={{ 
        zIndex: 1000, 
        position: 'fixed', 
        inset: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.4)', 
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out',
        padding: '1rem'
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        <div className="modal-content glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {step === 'confirm' ? 'Confirmar Unificación' : step === 'result' ? 'Resultado' : 'Unificar Pacientes'}
            </h3>
            {step !== 'result' && (
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            )}
          </div>

          {step === 'search' && (
            <>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: '8px', color: '#B45309', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Peligro:</strong> Vas a eliminar a un paciente para transferir todos sus ingresos, turnos y resultados médicos a <strong>{patientToKeep.name}</strong>. Busca el paciente duplicado que deseas ELIMINAR.
                </div>
              </div>

              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar paciente duplicado por nombre o DNI..." 
                    className="input-field" 
                    style={{ paddingLeft: '2.25rem', width: '100%' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isMerging}
                  />
                </div>
                <button type="submit" className="btn-secondary" disabled={isSearching || isMerging}>
                  {isSearching ? "Buscando..." : "Buscar"}
                </button>
              </form>

              {!patientToMerge && searchResults.length > 0 && (
                <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  {searchResults.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DNI: {p.dni} | OS: {p.health_insurance}</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setPatientToMerge(p)}
                        className="btn-secondary" 
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                      >
                        Seleccionar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {patientToMerge && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Se eliminará</div>
                    <div style={{ fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-muted)' }}>{patientToMerge.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DNI: {patientToMerge.dni}</div>
                  </div>
                  
                  <ArrowRight size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                  
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Se conservará</div>
                    <div style={{ fontWeight: 600 }}>{patientToKeep.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DNI: {patientToKeep.dni}</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" onClick={onClose} className="btn-secondary" disabled={isMerging}>
                  Cancelar
                </button>
                {patientToMerge && (
                  <button type="button" onClick={initiateMerge} className="btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} disabled={isMerging}>
                    Unificar Definitivamente
                  </button>
                )}
              </div>
            </>
          )}

          {step === 'confirm' && patientToMerge && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1.5rem', borderRadius: '8px', color: '#B91C1C', marginBottom: '1.5rem', textAlign: 'center' }}>
                <AlertTriangle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>¿Estás totalmente seguro?</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                  El paciente <strong>"{patientToMerge.name}"</strong> será eliminado permanentemente y todos sus datos se moverán a <strong>"{patientToKeep.name}"</strong>.
                  <br /><br />
                  Esta acción <strong>NO</strong> se puede deshacer.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setStep('search')} className="btn-secondary" disabled={isMerging}>
                  Cancelar
                </button>
                <button type="button" onClick={handleMerge} className="btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} disabled={isMerging}>
                  {isMerging ? "Unificando..." : "Sí, Unificar Pacientes"}
                </button>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out', textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                color: isError ? 'var(--danger)' : 'var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                {isError ? <X size={32} /> : <div style={{ fontSize: '2rem' }}>✓</div>}
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: isError ? 'var(--danger)' : 'var(--success)' }}>
                {isError ? 'Error al Unificar' : 'Unificación Exitosa'}
              </h4>
              <p style={{ color: 'var(--text-muted)' }}>
                {resultMsg}
              </p>
              {isError && (
                <button type="button" onClick={() => setStep('search')} className="btn-secondary" style={{ marginTop: '1.5rem' }}>
                  Volver a intentar
                </button>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </Portal>
  );
}
