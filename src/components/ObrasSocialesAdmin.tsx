"use client";

import { useState } from "react";
import { Plus, Trash2, Save, X, Edit2 } from "lucide-react";
import { createObraSocial, updateObraSocial, deleteObraSocial } from "@/actions/listados";

export default function ObrasSocialesAdmin({ initialData }: { initialData: any[] }) {
  const [items, setItems] = useState(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editActivo, setEditActivo] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  async function handleCreate() {
    if (!newNombre.trim()) return;
    setLoading(true);
    const res = await createObraSocial(newNombre);
    if (res.error) { setError(res.error); }
    else {
      setItems([...items, { id: Date.now(), nombre: newNombre.trim().toUpperCase(), activo: true }]);
      setNewNombre('');
      setShowNew(false);
    }
    setLoading(false);
  }

  async function handleUpdate(id: number) {
    setLoading(true);
    const res = await updateObraSocial(id, editNombre, editActivo);
    if (res.error) { setError(res.error); }
    else {
      setItems(items.map(it => it.id === id ? { ...it, nombre: editNombre.toUpperCase(), activo: editActivo } : it));
      setEditingId(null);
    }
    setLoading(false);
  }

  async function handleDelete(id: number, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    const res = await deleteObraSocial(id);
    if (res.error) { setError(res.error); }
    else { setItems(items.filter(it => it.id !== id)); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && (
        <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={14} /></button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Buscar obra social..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className="input-field" 
          style={{ flex: 1, maxWidth: '300px' }} 
        />
        <button onClick={() => setShowNew(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700 }}>
          <Plus size={16} /> Nueva Obra Social
        </button>
      </div>

      {showNew && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(14,165,233,0.04)' }}>
          <input
            type="text"
            value={newNombre}
            onChange={e => setNewNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Nombre de la obra social..."
            className="input-field"
            style={{ flex: 1 }}
            autoFocus
          />
          <button onClick={handleCreate} disabled={loading} className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '7px', fontWeight: 700 }}>
            {loading ? '...' : 'Agregar'}
          </button>
          <button onClick={() => { setShowNew(false); setNewNombre(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {items.filter(it => it.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
            borderRadius: '8px', border: '1px solid var(--glass-border)',
            background: item.activo ? 'transparent' : 'rgba(0,0,0,0.03)',
            opacity: item.activo ? 1 : 0.55,
          }}>
            {editingId === item.id ? (
              <>
                <input value={editNombre} onChange={e => setEditNombre(e.target.value)} className="input-field" style={{ flex: 1 }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={editActivo} onChange={e => setEditActivo(e.target.checked)} />
                  Activo
                </label>
                <button onClick={() => handleUpdate(item.id)} disabled={loading} style={{ color: 'var(--success)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Save size={18} />
                </button>
                <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{item.nombre}</span>
                <span style={{
                  padding: '0.15rem 0.5rem', borderRadius: '5px', fontSize: '0.73rem', fontWeight: 700,
                  background: item.activo ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.07)',
                  color: item.activo ? '#10B981' : 'var(--text-muted)',
                }}>
                  {item.activo ? 'Activa' : 'Inactiva'}
                </span>
                <button onClick={() => { setEditingId(item.id); setEditNombre(item.nombre); setEditActivo(item.activo); }} style={{ color: 'var(--primary)', background: 'rgba(14,165,233,0.08)', border: 'none', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(item.id, item.nombre)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
