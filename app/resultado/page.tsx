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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
          <img src="/logo.png" alt="LEGA" style={{ width: '120px', marginBottom: '2rem' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>Mis Resultados</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Ingresá tu DNI para consultar tus informes médicos.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
              <input 
                type="text" 
                placeholder="DNI del Paciente" 
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '2px solid #e0f2fe', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ padding: '1rem', fontSize: '1.1rem', borderRadius: '12px', width: '100%' }}
            >
              {loading ? "Verificando..." : "Ver mis resultados"}
            </button>
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600 }}>{error}</p>}
          </form>
          
          <p style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ¿Tenés problemas? <br /> Contactanos al <a href="tel:+5493513049709" style={{ color: 'var(--primary)', fontWeight: 700 }}>+54 9 3513 04-9709</a>
          </p>
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
      <nav style={{ background: 'white', padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img src="/logo.png" alt="LEGA" style={{ height: '32px' }} />
          <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{data.patient.name}</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DNI: {data.patient.dni}</p>
          </div>
        </div>
        <button onClick={() => setData(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.9rem' }}>
          <LogOut size={18} /> Salir
        </button>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('results')}
            style={{ 
              padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
              background: activeTab === 'results' ? 'var(--primary)' : 'white',
              color: activeTab === 'results' ? 'white' : 'var(--text-muted)',
              border: activeTab === 'results' ? 'none' : '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <FileText size={20} /> RESULTADOS MÉDICOS
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{ 
              padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
              background: activeTab === 'history' ? 'var(--primary)' : 'white',
              color: activeTab === 'history' ? 'white' : 'var(--text-muted)',
              border: activeTab === 'history' ? 'none' : '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <History size={20} /> MI HISTORIAL
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
          <input 
            type="text" 
            placeholder="Filtrar por fecha o tipo de análisis (ej: Hemograma, 20/04...)" 
            value={portalSearch}
            onChange={(e) => setPortalSearch(e.target.value)}
            style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', outline: 'none', fontSize: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          />
        </div>

        {activeTab === 'results' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredResults.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <Info size={48} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <h3>No hay resultados disponibles</h3>
                <p style={{ color: 'var(--text-muted)' }}>{portalSearch ? "No hay resultados que coincidan con tu búsqueda." : "Tus informes aparecerán aquí una vez que el laboratorio los cargue."}</p>
              </div>
            ) : (
              filteredResults.map((res: any) => (
                <div key={res.id} className="glass-panel" style={{ overflow: 'hidden', border: selectedResult?.id === res.id ? '2px solid var(--primary)' : '1px solid var(--glass-border)', background: 'white' }}>
                  <div 
                    onClick={() => setSelectedResult(selectedResult?.id === res.id ? null : res)}
                    style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ background: res.result_type === 'pdf' ? '#fee2e2' : (res.result_type === 'image' ? '#f0f9ff' : '#fef9c3'), padding: '1rem', borderRadius: '12px' }}>
                        {res.result_type === 'pdf' ? <FileText color="#ef4444" size={24} /> : (res.result_type === 'image' ? <Eye color="var(--primary)" size={24} /> : <History color="#ca8a04" size={24} />)}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{res.analysis_type || "Informe Médico"}</h4>
                        {res.report_id && (
                          <span style={{ fontSize: '0.75rem', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 800, marginTop: '0.25rem', display: 'inline-block' }}>
                            INFORME N° {res.report_id}
                          </span>
                        )}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>
                          Cargado el {format(new Date(res.created_at), "d 'de' MMMM", { locale: es })}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={24} style={{ transform: selectedResult?.id === res.id ? 'rotate(90deg)' : 'none', transition: 'all 0.3s', opacity: 0.3 }} />
                  </div>

                  {selectedResult?.id === res.id && (
                    <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid #f1f5f9', animation: 'fadeIn 0.3s ease' }}>
                      <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          <Calendar size={16} /> Turno: {format(new Date(res.appointment_date), "dd/MM/yyyy")}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          <CheckCircle size={16} color="var(--success)" /> {res.analysis_type}
                        </div>
                      </div>

                      {/* INLINE VIEWER */}
                      <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {res.result_type === 'pdf' ? (
                          <iframe src={`/api/medical-result/file/${res.id}`} style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px' }} />
                        ) : res.result_type === 'image' ? (
                          <img src={`/api/medical-result/file/${res.id}`} alt="Resultado" style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        ) : (
                          <div style={{ padding: '2rem', width: '100%', fontSize: '1.1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
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
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
                            background: 'white', border: '2px solid var(--primary)', color: 'var(--primary)',
                            borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem' 
                          }}
                        >
                          <Download size={18} /> DESCARGAR INFORME
                        </a>
                        <a 
                          href={`https://wa.me/5493513049709?text=${encodeURIComponent("Hola, necesito realizar una consulta sobre mi Resumen Medico cargado el " + format(new Date(res.created_at), "dd/MM/yyyy"))}`} 
                          target="_blank"
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
                            background: '#25D366', color: 'white',
                            borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem' 
                          }}
                        >
                          <MessageSquare size={18} /> CONSULTAR POR WHATSAPP
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Análisis</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt: any) => (
                  <tr key={apt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{format(new Date(apt.appointment_date), "dd/MM/yyyy")}</td>
                    <td style={{ padding: '1rem' }}>{apt.analysis_type}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: apt.status === 'COMPLETADO' ? '#dcfce7' : '#fee2e2', 
                        color: apt.status === 'COMPLETADO' ? '#166534' : '#991b1b',
                        padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron turnos.</td>
                  </tr>
                )}
              </tbody>
            </table>
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
