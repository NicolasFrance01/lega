"use client";

import { useState } from "react";
import { getPatientPortalData } from "@/actions/medical_results";
import { FileText, Download, MessageSquare, Calendar, History, Search, User, LogOut, ExternalLink, ChevronRight, CheckCircle, Info, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ResultadoPortal() {
  const [dni, setDni] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"results" | "history">("results");
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [portalSearch, setPortalSearch] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (dni.length < 5) return;
    setLoading(true);
    setError("");
    const res = await getPatientPortalData(dni);
    if (res.data) {
      setData(res.data);
    } else {
      setError(res.error || "No se encontraron datos para este DNI.");
    }
    setLoading(false);
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', position: 'fixed', top: 0, left: 0 }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3.5rem 3rem', textAlign: 'center', animation: 'fadeIn 0.5s ease', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <img src="/logo.png" alt="LEGA" style={{ width: '140px', marginBottom: '1.5rem' }} />
            <div style={{ display: 'inline-block', padding: '0.25rem 1rem', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Portal de Pacientes
            </div>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.75rem', color: '#1e293b' }}>Mis Resultados</h1>
          <p style={{ color: '#64748b', marginBottom: '2.5rem', fontWeight: 500, lineHeight: 1.5 }}>Ingresá tu DNI para consultar tus informes médicos y el historial de tus turnos.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <User size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, color: 'var(--primary)' }} />
              <input 
                type="text" 
                placeholder="DNI del Paciente" 
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
                style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '16px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '1.1rem', fontWeight: 700, transition: 'all 0.2s', background: 'white' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ padding: '1.1rem', fontSize: '1.1rem', borderRadius: '16px', width: '100%', fontWeight: 800, boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)' }}
            >
              {loading ? "Verificando..." : "VER MIS RESULTADOS"}
            </button>
            {error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 700, border: '1px solid #fee2e2' }}>
                {error}
              </div>
            )}
          </form>
          
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
              ¿Necesitás ayuda con tus resultados? <br /> 
              <a href="https://wa.me/5493513049709" target="_blank" style={{ color: '#25D366', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                <MessageSquare size={16} /> Contactar Soporte WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const results = data.results || [];
  const appointments = data.appointments || [];

  const filteredResults = results.filter((res: any) => {
    const s = portalSearch.toLowerCase();
    const dateStr = res.appointment_date ? format(new Date(res.appointment_date), "dd/MM/yyyy") : "";
    return res.analysis_type?.toLowerCase().includes(s) || dateStr.includes(s) || res.report_id?.toLowerCase().includes(s);
  });

  const filteredAppointments = appointments.filter((apt: any) => {
    const s = portalSearch.toLowerCase();
    const dateStr = format(new Date(apt.appointment_date), "dd/MM/yyyy");
    return apt.analysis_type?.toLowerCase().includes(s) || dateStr.includes(s) || apt.report_id?.toLowerCase().includes(s);
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Patient Header */}
      <nav style={{ background: 'white', padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img src="/logo.png" alt="LEGA" style={{ height: '35px' }} />
          <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{data.patient.name}</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>DNI: {data.patient.dni}</p>
          </div>
        </div>
        <button onClick={() => setData(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 800, fontSize: '0.9rem', background: '#fef2f2', padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
          <LogOut size={18} /> Salir
        </button>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('results')}
            style={{ 
              padding: '1rem 2rem', borderRadius: '16px', fontWeight: 800, fontSize: '1rem',
              background: activeTab === 'results' ? 'var(--primary)' : 'white',
              color: activeTab === 'results' ? 'white' : '#64748b',
              border: 'none',
              boxShadow: activeTab === 'results' ? '0 10px 15px -3px rgba(14, 165, 233, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s', cursor: 'pointer'
            }}
          >
            <FileText size={22} /> RESULTADOS MÉDICOS
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{ 
              padding: '1rem 2rem', borderRadius: '16px', fontWeight: 800, fontSize: '1rem',
              background: activeTab === 'history' ? 'var(--primary)' : 'white',
              color: activeTab === 'history' ? 'white' : '#64748b',
              border: 'none',
              boxShadow: activeTab === 'history' ? '0 10px 15px -3px rgba(14, 165, 233, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s', cursor: 'pointer'
            }}
          >
            <History size={22} /> MI HISTORIAL
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
          <input 
            type="text" 
            placeholder="Buscar por fecha, tipo de análisis o número de informe..." 
            value={portalSearch}
            onChange={(e) => setPortalSearch(e.target.value)}
            style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.8rem', borderRadius: '20px', border: '1px solid #e2e8f0', background: 'white', outline: 'none', fontSize: '1.1rem', fontWeight: 500, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
          />
        </div>

        {activeTab === 'results' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredResults.length === 0 ? (
              <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ background: '#f0f9ff', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Info size={40} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No hay resultados disponibles</h3>
                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto', fontWeight: 500 }}>{portalSearch ? "No hay resultados que coincidan con tu búsqueda." : "Tus informes aparecerán aquí una vez que el laboratorio los procese y cargue al sistema."}</p>
              </div>
            ) : (
              filteredResults.map((res: any) => (
                <div key={res.id} style={{ borderRadius: '24px', overflow: 'hidden', border: selectedResult?.id === res.id ? '2px solid var(--primary)' : '1px solid #e2e8f0', background: 'white', transition: 'all 0.3s ease', boxShadow: selectedResult?.id === res.id ? '0 20px 25px -5px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div 
                    onClick={() => setSelectedResult(selectedResult?.id === res.id ? null : res)}
                    style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
                      <div style={{ background: res.result_type === 'pdf' ? '#fee2e2' : (res.result_type === 'image' ? '#f0f9ff' : '#fef9c3'), padding: '1.1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {res.result_type === 'pdf' ? <FileText color="#ef4444" size={28} /> : (res.result_type === 'image' ? <Eye color="var(--primary)" size={28} /> : <History color="#ca8a04" size={28} />)}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>{res.analysis_type || "Informe Médico"}</h4>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {res.report_id && (
                            <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 900 }}>
                              N° {res.report_id}
                            </span>
                          )}
                          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                            Cargado el {format(new Date(res.created_at), "d 'de' MMMM", { locale: es })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {res.notes && !selectedResult && <MessageSquare size={18} color="var(--primary)" style={{ opacity: 0.6 }} />}
                      <ChevronRight size={26} style={{ transform: selectedResult?.id === res.id ? 'rotate(90deg)' : 'none', transition: 'all 0.3s', opacity: 0.3 }} />
                    </div>
                  </div>

                  {selectedResult?.id === res.id && (
                    <div style={{ padding: '0 1.75rem 1.75rem', borderTop: '1px solid #f1f5f9', animation: 'fadeIn 0.3s ease' }}>
                      <div style={{ padding: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>
                          <Calendar size={18} /> Turno: {format(new Date(res.appointment_date), "dd/MM/yyyy")}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>
                          <CheckCircle size={18} color="var(--success)" /> {res.analysis_type}
                        </div>
                      </div>

                      {res.notes && (
                        <div style={{ background: '#f0f9ff', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #e0f2fe' }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Nota del Profesional:</p>
                          <p style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.6 }}>{res.notes}</p>
                        </div>
                      )}

                      {/* INLINE VIEWER */}
                      <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '1.75rem', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {res.result_type === 'pdf' ? (
                          <iframe src={`/api/medical-result/file/${res.id}`} style={{ width: '100%', height: '650px', border: 'none' }} />
                        ) : res.result_type === 'image' ? (
                          <img src={`/api/medical-result/file/${res.id}`} alt="Resultado" style={{ maxWidth: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        ) : (
                          <div style={{ padding: '2.5rem', width: '100%', fontSize: '1.15rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#1e293b', fontWeight: 500 }}>
                            {res.content}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                        <a 
                          href={`/api/medical-result/file/${res.id}`} 
                          download={res.filename || `resultado_${res.id}`} 
                          target="_blank"
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.75rem', 
                            background: 'white', border: '2px solid var(--primary)', color: 'var(--primary)',
                            borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', transition: 'all 0.2s', textDecoration: 'none'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary)'; }}
                        >
                          <Download size={20} /> DESCARGAR INFORME
                        </a>
                        <a 
                          href={`https://wa.me/5493513049709?text=${encodeURIComponent("Hola, necesito realizar una consulta sobre mi Resumen Medico N° " + (res.report_id || '-') + " del día " + format(new Date(res.created_at), "dd/MM/yyyy"))}`} 
                          target="_blank"
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.75rem', 
                            background: '#25D366', color: 'white',
                            borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)'
                          }}
                        >
                          <MessageSquare size={20} /> CONSULTAR POR WHATSAPP
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>N° Informe</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Análisis / Estudio</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt: any) => (
                    <tr key={apt.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#1e293b' }}>{format(new Date(apt.appointment_date), "dd/MM/yyyy")}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        {apt.report_id ? (
                          <span style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem' }}>
                            {apt.report_id}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#475569' }}>{apt.analysis_type}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ 
                          background: apt.status === 'COMPLETADO' ? '#dcfce7' : '#fee2e2', 
                          color: apt.status === 'COMPLETADO' ? '#166534' : '#991b1b',
                          padding: '0.4rem 1rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800
                        }}>
                          {apt.status === 'COMPLETADO' ? 'LISTO' : apt.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#64748b', maxWidth: '250px' }}>
                        {apt.notes ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                             <MessageSquare size={14} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                             <span>{apt.notes}</span>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                  {filteredAppointments.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>No se encontraron turnos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '4rem', padding: '3rem 2rem', background: 'white', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>© {new Date().getFullYear()} LEGA Laboratorio Bioquímico</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
              Acceso Seguro
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
              Resultados Verificados
           </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
