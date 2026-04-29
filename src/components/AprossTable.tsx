"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { createApross, deleteApross, updateApross } from "@/actions/listados";
import { searchPatients } from "@/actions/patients";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Trash2, Save, X, Search, FileText, Upload, Check, AlertCircle } from "lucide-react";

export default function AprossTable({ data }: { data: any[] }) {
  const [items, setItems] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewRow, setShowNewRow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    setItems(data);
  }, [data]);

  // New item form state
  const [newPaciente, setNewPaciente] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [analisisFields, setAnalisisFields] = useState<string[]>([""]);

  const addAnalisisField = () => setAnalisisFields([...analisisFields, ""]);
  const removeAnalisisField = (index: number) => {
    if (analisisFields.length > 1) {
      setAnalisisFields(analisisFields.filter((_, i) => i !== index));
    }
  };
  const updateAnalisisField = (index: number, value: string) => {
    const newFields = [...analisisFields];
    newFields[index] = value;
    setAnalisisFields(newFields);
  };

  const resetForm = () => {
    setNewPaciente("");
    setSelectedPatient(null);
    setFiles([]);
    setAnalisisFields([""]);
    if (formRef.current) formRef.current.reset();
  };

  // Filtering
  const filteredItems = items.filter(it => 
    (it.paciente?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (it.dni || "").includes(searchTerm) ||
    (it.analisis?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Group by month
  const groups = filteredItems.reduce((acc: any, item: any) => {
    if (!item.fecha) return acc;
    const dateObj = new Date(item.fecha);
    if (isNaN(dateObj.getTime())) return acc;
    
    const month = item.month_group || format(dateObj, "yyyy-MM");
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  // Autocomplete logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (newPaciente.length > 1 && !selectedPatient) {
        const res = await searchPatients(newPaciente);
        if (res.data) setSuggestions(res.data);
      } else {
        setSuggestions([]);
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [newPaciente, selectedPatient]);

  const handleSelectPatient = (p: any) => {
    setSelectedPatient(p);
    setNewPaciente(p.name);
    setSuggestions([]);
  };

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este registro de Apross?")) return;
    const res = await deleteApross(id);
    if (!res.error) {
      setItems(items.filter(it => it.id !== id));
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header & Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            placeholder="Buscar por paciente, DNI o análisis..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "2.8rem" }}
          />
        </div>
        <button onClick={() => { resetForm(); setShowNewRow(true); }} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={18} /> Agregar Nuevo
        </button>
      </div>

      {/* New Entry Form */}
      {showNewRow && (
        <div className="glass-panel shadow-premium" style={{ padding: "2rem", border: "2px solid var(--primary)", position: "relative" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>Nueva Carga Apross</h3>
          <form 
            ref={formRef}
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const fd = new FormData(e.currentTarget);
              
              startTransition(async () => {
                try {
                  const res = await createApross(fd) as any;
                  if (res && res.error) {
                    alert("Error al guardar: " + res.error);
                  } else {
                    setShowNewRow(false);
                  }
                } catch (err: any) {
                  alert("Error crítico: " + err.message);
                } finally {
                  setLoading(false);
                }
              });
            }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            
            <div style={{ position: "relative" }}>
              <label className="label-premium">Paciente</label>
              <input 
                name="paciente" 
                value={newPaciente}
                onChange={(e) => { setNewPaciente(e.target.value); setSelectedPatient(null); }}
                required 
                className="input-field" 
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <div className="glass-panel" style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, maxHeight: "200px", overflow: "auto", marginTop: "4px" }}>
                  {suggestions.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => handleSelectPatient(p)}
                      style={{ padding: "0.75rem 1rem", cursor: "pointer", borderBottom: "1px solid var(--glass-border)" }}
                      className="suggestion-item"
                    >
                      <strong>{p.name}</strong> <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>- DNI: {p.dni}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label-premium">Fecha</label>
              <input name="fecha" type="date" required className="input-field" defaultValue={format(new Date(), "yyyy-MM-dd")} />
            </div>

            <div>
              <label className="label-premium">DNI</label>
              <input 
                name="dni" 
                defaultValue={selectedPatient?.dni || ""} 
                placeholder="Solo números o '-'" 
                className="input-field" 
                onKeyPress={(e) => { if (!/[0-9-]/.test(e.key)) e.preventDefault(); }}
              />
            </div>

            <div>
              <label className="label-premium">Teléfono</label>
              <input 
                name="telefono" 
                defaultValue={selectedPatient?.phone || ""} 
                placeholder="Solo números o '-'" 
                className="input-field" 
                onKeyPress={(e) => { if (!/[0-9-]/.test(e.key)) e.preventDefault(); }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label className="label-premium">Análisis</label>
                <button type="button" onClick={addAnalisisField} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Plus size={16} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {analisisFields.map((field, index) => (
                  <div key={index} style={{ display: "flex", gap: "0.5rem" }}>
                    <input 
                      name="analisis" 
                      value={field}
                      onChange={(e) => updateAnalisisField(index, e.target.value)}
                      required={index === 0} 
                      className="input-field" 
                      placeholder="Ej: Hemograma..." 
                    />
                    {analisisFields.length > 1 && (
                      <button type="button" onClick={() => removeAnalisisField(index)} style={{ color: "var(--danger)", border: "none", background: "none", cursor: "pointer" }}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="label-premium">Co.Seguro ($)</label>
              <input 
                name="coseguro" 
                type="text" 
                className="input-field" 
                placeholder="Solo números o '-'"
                onKeyPress={(e) => { if (!/[0-9.-]/.test(e.key)) e.preventDefault(); }}
              />
            </div>

            <div>
              <label className="label-premium">Particular ($)</label>
              <input 
                name="particular" 
                type="text" 
                className="input-field" 
                placeholder="Solo números o '-'"
                onKeyPress={(e) => { if (!/[0-9.-]/.test(e.key)) e.preventDefault(); }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label className="label-premium">Observación / Detalle</label>
              <textarea name="observaciones" className="input-field" style={{ minHeight: "80px", resize: "none" }} />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label className="label-premium">Pedido Médico (PDF/Imágenes)</label>
              <div style={{ 
                border: "2px dashed var(--glass-border)", padding: "1rem", borderRadius: "12px", textAlign: "center",
                background: "rgba(0,0,0,0.02)", cursor: "pointer"
              }} onClick={() => document.getElementById('file-input')?.click()}>
                <Upload size={24} style={{ color: "var(--primary)", marginBottom: "0.5rem" }} />
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>Click para subir archivos</p>
                <input 
                  id="file-input"
                  name="documents"
                  type="file" 
                  multiple 
                  accept="image/*,application/pdf" 
                  style={{ display: "none" }} 
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    setFiles(prev => [...prev, ...selected]);
                  }}
                />
              </div>
              {files.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ padding: "0.4rem 0.8rem", background: "var(--primary)", color: "white", borderRadius: "20px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {f.name} <X size={14} onClick={(e) => { e.stopPropagation(); setFiles(files.filter((_, idx) => idx !== i)); }} style={{ cursor: "pointer" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: "1rem" }}>
                {loading ? "GUARDANDO..." : "GUARDAR CARGA"}
              </button>
              <button type="button" onClick={() => setShowNewRow(false)} style={{ padding: "1rem", borderRadius: "12px", background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", fontWeight: 700 }}>
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tables by Month */}
      {sortedMonths.map(month => (
        <div key={month} className="glass-panel" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", background: "linear-gradient(90deg, var(--primary) 0%, #0ea5e9 100%)", color: "white" }}>
            <h4 style={{ margin: 0, textTransform: "capitalize", fontWeight: 800 }}>
              {(() => {
                try {
                  const date = new Date(month + "-02");
                  if (isNaN(date.getTime())) return month;
                  return format(date, "MMMM yyyy", { locale: es });
                } catch (e) {
                  return month;
                }
              })()}
            </h4>
          </div>
          <div className="table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-muted)", borderBottom: "1px solid var(--glass-border)" }}>
                  <th style={{ padding: "1rem" }}>Fecha</th>
                  <th style={{ padding: "1rem" }}>Paciente</th>
                  <th style={{ padding: "1rem" }}>DNI / Tel</th>
                  <th style={{ padding: "1rem" }}>Análisis</th>
                  <th style={{ padding: "1rem" }}>Coseguro</th>
                  <th style={{ padding: "1rem" }}>Particular</th>
                  <th style={{ padding: "1rem" }}>Documentos</th>
                  <th style={{ padding: "1rem" }}>Obs / Detalle</th>
                  <th style={{ padding: "1rem", textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody>
                {groups[month].map((item: any) => {
                  const dateObj = new Date(item.fecha);
                  const formattedDate = isNaN(dateObj.getTime()) ? "Fecha inválida" : format(dateObj, "dd/MM/yyyy");
                  
                  return (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    <td style={{ padding: "1rem", whiteSpace: "nowrap" }}>{formattedDate}</td>
                    <td style={{ padding: "1rem", fontWeight: 700, color: "var(--text-main)" }}>{item.paciente}</td>
                    <td style={{ padding: "1rem" }}>
                      <div>{item.dni || "-"}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.telefono || "-"}</div>
                    </td>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "var(--primary)" }}>{item.analisis}</td>
                    <td style={{ padding: "1rem", fontWeight: 700, color: "var(--success)" }}>{item.coseguro ? `$${item.coseguro}` : "-"}</td>
                    <td style={{ padding: "1rem", fontWeight: 700 }}>{item.particular ? `$${item.particular}` : "-"}</td>
                    <td style={{ padding: "1rem" }}>
                      {Array.isArray(item.documents) && item.documents.length > 0 ? (
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          {item.documents.map((d: any) => (
                            <a key={d.id} href={d.url} target="_blank" title={d.filename} style={{ color: "var(--primary)" }}>
                              <FileText size={18} />
                            </a>
                          ))}
                        </div>
                      ) : "-"}
                    </td>
                    <td style={{ padding: "1rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.observaciones}>
                      {item.observaciones || "-"}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button onClick={() => setEditingItem(item)} style={{ padding: "0.4rem", borderRadius: "8px", background: "rgba(14, 165, 233, 0.1)", color: "var(--primary)", border: "none", cursor: "pointer" }}>
                        <Plus size={16} style={{ transform: "rotate(45deg)" }} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ padding: "0.4rem", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", border: "none", cursor: "pointer" }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {/* Editing Modal */}
      {editingItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="glass-panel shadow-premium" style={{ width: "100%", maxWidth: "800px", maxHeight: "90vh", overflow: "auto", padding: "2rem", position: "relative" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>Editar Carga Apross</h3>
            <form action={async (fd) => {
              setLoading(true);
              const res = await updateApross(editingItem.id, Object.fromEntries(fd));
              if (!res.error) {
                setEditingItem(null);
                setLoading(false);
              } else {
                alert("Error al actualizar: " + res.error);
                setLoading(false);
              }
            }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
              
              <div>
                <label className="label-premium">Paciente</label>
                <input name="paciente" defaultValue={editingItem.paciente} required className="input-field" />
              </div>

              <div>
                <label className="label-premium">Fecha</label>
                <input name="fecha" type="date" defaultValue={editingItem.fecha ? format(new Date(editingItem.fecha), "yyyy-MM-dd") : ""} required className="input-field" />
              </div>

              <div>
                <label className="label-premium">DNI</label>
                <input name="dni" defaultValue={editingItem.dni} className="input-field" />
              </div>

              <div>
                <label className="label-premium">Teléfono</label>
                <input name="telefono" defaultValue={editingItem.telefono} className="input-field" />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label className="label-premium">Análisis</label>
                <input name="analisis" defaultValue={editingItem.analisis} required className="input-field" />
              </div>

              <div>
                <label className="label-premium">Co.Seguro ($)</label>
                <input name="coseguro" defaultValue={editingItem.coseguro} className="input-field" />
              </div>

              <div>
                <label className="label-premium">Particular ($)</label>
                <input name="particular" defaultValue={editingItem.particular} className="input-field" />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label className="label-premium">Observación / Detalle</label>
                <textarea name="observaciones" defaultValue={editingItem.observaciones} className="input-field" style={{ minHeight: "80px", resize: "none" }} />
              </div>

              <div style={{ gridColumn: "span 2", display: "flex", gap: "1rem" }}>
                <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: "1rem" }}>
                  {loading ? "ACTUALIZANDO..." : "GUARDAR CAMBIOS"}
                </button>
                <button type="button" onClick={() => setEditingItem(null)} style={{ padding: "1rem", borderRadius: "12px", background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", fontWeight: 700 }}>
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sortedMonths.length === 0 && !loading && (
        <div className="glass-panel" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
           No hay registros de Apross encontrados.
        </div>
      )}
    </div>
  );
}
