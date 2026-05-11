"use client";

import { useState } from "react";
import { getPatientPortalData } from "@/actions/medical_results";
import { FileText, Download, MessageSquare, Calendar, History, Search, User, LogOut, ExternalLink, ChevronRight, CheckCircle, Info, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function TotemPortal() {
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
      <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', textAlign: 'center', animation: 'fadeIn 0.5s ease', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
            <img src="/logo.png" alt="LEGA" style={{ width: '150px', maxWidth: '85%', height: 'auto', marginBottom: '1.5rem' }} />
            <div style={{ padding: '0.4rem 1.25rem', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
              Portal de Pacientes
            </div>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.75rem', color: '#1e293b', letterSpacing: '-0.02em' }}>Mis Resultados</h1>
          <p style={{ color: '#64748b', marginBottom: '2.5rem', fontWeight: 500, lineHeight: 1.6, fontSize: '1.05rem' }}>Ingresá tu DNI para consultar tus informes médicos y el historial de tus turnos.</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <User size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: 'var(--primary)' }} />
              <input
                type="text"
                inputMode="numeric"
                placeholder="DNI del Paciente"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
                style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '16px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '1.1rem', fontWeight: 700, transition: 'all 0.2s', background: 'white' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '1.1rem', fontSize: '1.1rem', borderRadius: '16px', width: '100%', fontWeight: 800, boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.4)', marginTop: '0.5rem' }}
            >
              {loading ? "Verificando..." : "VER MIS RESULTADOS"}
            </button>
            {error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '14px', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 700, border: '1px solid #fee2e2', animation: 'shake 0.4s ease' }}>
                {error}
              </div>
            )}
          </form>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1.5 }}>
              ¿Necesitás ayuda con tus resultados? <br />
              <a href="https://wa.me/5493513049709" target="_blank" style={{ color: '#25D366', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '1rem' }}>
                <MessageSquare size={20} /> Contactar por WhatsApp
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
      <nav style={{ background: 'white', padding: '0.75rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img src="/logo.png" alt="LEGA" style={{ height: '32px' }} />
          <div style={{ height: '20px', width: '1px', background: '#e2e8f0' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>{data.patient.name}</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>DNI: {data.patient.dni}</p>
          </div>
        </div>
        <button onClick={() => setData(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 800, fontSize: '0.95rem', background: '#fef2f2', padding: '0.45rem 0.85rem', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
          <LogOut size={18} /> <span className="hide-mobile">Salir</span>
        </button>
      </nav>

      <main className="portal-main" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="portal-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('results')}
            style={{
              padding: '0.85rem 1.5rem', borderRadius: '16px', fontWeight: 800, fontSize: '1rem',
              background: activeTab === 'results' ? 'var(--primary)' : 'white',
              color: activeTab === 'results' ? 'white' : '#64748b',
              border: 'none',
              boxShadow: activeTab === 'results' ? '0 10px 15px -3px rgba(14, 165, 233, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
            }}
          >
            <FileText size={22} /> RESULTADOS MÉDICOS
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.85rem 1.5rem', borderRadius: '16px', fontWeight: 800, fontSize: '1rem',
              background: activeTab === 'history' ? 'var(--primary)' : 'white',
              color: activeTab === 'history' ? 'white' : '#64748b',
              border: 'none',
              boxShadow: activeTab === 'history' ? '0 10px 15px -3px rgba(14, 165, 233, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
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
            placeholder="Buscar por fecha, análisis o informe..."
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
                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto', fontWeight: 500 }}>{portalSearch ? "No hay resultados que coincidan con tu búsqueda." : "Tus informes aparecerán aquí una vez que el laboratorio los procese."}</p>
              </div>
            ) : (
              Object.values(filteredResults.reduce((acc: any, res: any) => {
                const key = res.appointment_id || res.id;
                if (!acc[key]) acc[key] = {
                    id: key,
                    date: res.appointment_date,
                    report_id: res.report_id,
                    items: []
                };
                acc[key].items.push(res);
                return acc;
              }, {})).map((group: any) => (
                <div key={group.id} style={{ borderRadius: '24px', overflow: 'hidden', border: selectedResult?.appointment_id === group.id || selectedResult?.id === group.id ? '2px solid var(--primary)' : '1px solid #e2e8f0', background: 'white', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: selectedResult?.appointment_id === group.id ? '0 20px 25px -5px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div
                    onClick={() => {
                        const firstItem = group.items[0];
                        setSelectedResult(selectedResult?.id === firstItem.id ? null : firstItem);
                    }}
                    className="portal-card-header"
                    style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText color="var(--primary)" size={24} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>
                            {group.items.length > 1 ? `Múltiples Resultados (${group.items.length})` : (group.items[0].analysis_type || "Informe Médico")}
                        </h4>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {group.report_id && (
                            <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 900 }}>
                              N° {group.report_id}
                            </span>
                          )}
                          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                             Turno del {format(new Date(group.date), "d 'de' MMMM, yyyy", { locale: es })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <ChevronRight size={20} style={{ transform: (selectedResult?.appointment_id === group.id || selectedResult?.id === group.id) ? 'rotate(90deg)' : 'none', transition: 'all 0.3s', opacity: 0.3 }} />
                    </div>
                  </div>

                  {(selectedResult?.appointment_id === group.id || selectedResult?.id === group.id) && (
                    <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid #f1f5f9', animation: 'fadeIn 0.3s ease' }}>

                      {group.items.length > 1 && (
                        <div style={{ padding: '1.25rem 0', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9', marginBottom: '1.5rem' }}>
                            {group.items.map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedResult(item)}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800,
                                        background: selectedResult?.id === item.id ? 'var(--primary)' : 'rgba(14, 165, 233, 0.05)',
                                        color: selectedResult?.id === item.id ? 'white' : 'var(--primary)',
                                        border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {item.analysis_type}
                                </button>
                            ))}
                        </div>
                      )}

                      <div style={{ padding: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>
                          <CheckCircle size={18} color="var(--success)" /> {selectedResult?.analysis_type}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                            Cargado el {format(new Date(selectedResult?.created_at), "dd/MM/yyyy HH:mm")} hs
                        </div>
                      </div>

                      {selectedResult?.notes && (
                        <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e0f2fe' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Nota del Profesional:</p>
                          <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.5 }}>{selectedResult?.notes}</p>
                        </div>
                      )}

                      {/* INLINE VIEWER */}
                      <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '1.5rem', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {selectedResult?.result_type === 'pdf' ? (
                          <iframe src={`/api/medical-result/file/${selectedResult?.id}`} style={{ width: '100%', height: '650px', border: 'none' }} />
                        ) : selectedResult?.result_type === 'image' ? (
                          <img src={`/api/medical-result/file/${selectedResult?.id}`} alt="Resultado" style={{ maxWidth: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        ) : (
                          <div style={{ padding: '2rem', width: '100%', fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#1e293b', fontWeight: 500 }}>
                            {selectedResult?.content}
                          </div>
                        )}
                      </div>

                      <div className="portal-card-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                        <a
                          href={`/api/medical-result/file/${selectedResult?.id}`}
                          download={selectedResult?.filename || `resultado_${selectedResult?.id}`}
                          target="_blank"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.75rem',
                            background: 'white', border: '2px solid var(--primary)', color: 'var(--primary)',
                            borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', transition: 'all 0.2s', textDecoration: 'none'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary)'; }}
                        >
                          <Download size={20} /> <span className="hide-mobile">DESCARGAR</span> INFORME
                        </a>
                        <a
                          href={`https://wa.me/5493513049709?text=${encodeURIComponent("Hola, necesito realizar una consulta sobre mi resultado de " + (selectedResult?.analysis_type || 'Análisis') + " (Informe N° " + (selectedResult?.report_id || '-') + ") del día " + format(new Date(selectedResult?.created_at), "dd/MM/yyyy"))}`}
                          target="_blank"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.75rem',
                            background: '#25D366', color: 'white',
                            borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)'
                          }}
                        >
                          <MessageSquare size={20} /> CONSULTAR <span className="hide-mobile">POR WHATSAPP</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {/* Desktop View */}
            <div className="hide-mobile" style={{ overflowX: 'auto', display: 'block' }}>
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
                <tbody style={{ fontSize: '0.95rem' }}>
                  {filteredAppointments.map((apt: any) => (
                    <tr key={apt.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#1e293b' }}>{format(new Date(apt.appointment_date), "dd/MM/yyyy")}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        {apt.report_id ? (
                          <span style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', padding: '0.3rem 0.7rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem' }}>
                            {apt.report_id}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#475569' }}>
                        {apt.analyses && apt.analyses.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                {apt.analyses.map((a: any, i: number) => (
                                    <div key={i} style={{ fontSize: '0.8rem' }}>• {a.name}{a.subtype ? ` (${a.subtype})` : ''}</div>
                                ))}
                            </div>
                        ) : (
                            apt.analysis_type
                        )}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{
                          background: apt.status === 'COMPLETADO' ? '#dcfce7' : '#fee2e2',
                          color: apt.status === 'COMPLETADO' ? '#166534' : '#991b1b',
                          padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800
                        }}>
                          {apt.status === 'COMPLETADO' ? 'LISTO' : apt.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                        {apt.notes || <span style={{ opacity: 0.3 }}>-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Card based to ensure "Nota" is visible */}
            <div className="show-mobile" style={{ display: 'none', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
               {filteredAppointments.map((apt: any) => (
                 <div key={apt.id} style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{format(new Date(apt.appointment_date), "dd/MM/yyyy")}</span>
                       <span style={{ fontSize: '0.8rem', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontWeight: 800 }}>
                          N° {apt.report_id || '-'}
                       </span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', lineHeight: 1.4 }}>
                        {apt.analyses && apt.analyses.length > 0 ? (
                            apt.analyses.map((a: any) => a.name).join(', ')
                        ) : (
                            apt.analysis_type
                        )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{
                          background: apt.status === 'COMPLETADO' ? '#dcfce7' : '#fee2e2',
                          color: apt.status === 'COMPLETADO' ? '#166534' : '#991b1b',
                          padding: '0.3rem 1rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800
                       }}>
                          {apt.status === 'COMPLETADO' ? 'RESULTADO LISTO' : apt.status}
                       </span>
                    </div>
                    {apt.notes && (
                      <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                         <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Nota del Laboratorio:</div>
                         {apt.notes}
                      </div>
                    )}
                 </div>
               ))}
               {filteredAppointments.length === 0 && (
                 <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>No se encontraron turnos registrados.</div>
               )}
            </div>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '4rem', padding: '3rem 2rem', background: 'white', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <img src="/logo.png" alt="LEGA" style={{ height: '32px', opacity: 0.5, marginBottom: '1rem' }} />
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>© {new Date().getFullYear()} LEGA Laboratorio Bioquímico</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
              Sistema Protegido
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
              Resultados Validados
           </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
