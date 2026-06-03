"use client";

import { useState, useEffect } from "react";
import { X, Check, FileText, Loader2, Send } from "lucide-react";
import { getInternalNotesHistory, updateInternalNote, markInternalNoteAsRead } from "@/actions/ingresos";
import { format } from "date-fns";

export default function InternalNotesModal({ 
  ingresoId, 
  onClose, 
  onRefresh 
}: { 
  ingresoId: string; 
  onClose: () => void; 
  onRefresh: () => void; 
}) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [ingresoId]);

  async function loadNotes() {
    setLoading(true);
    const res = await getInternalNotesHistory(ingresoId);
    if (res.success && res.notes) {
      setNotes(res.notes);
    }
    setLoading(false);
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setSaving(true);
    const res = await updateInternalNote(ingresoId, newNote);
    if (res.success) {
      setNewNote("");
      await loadNotes();
      onRefresh();
      window.dispatchEvent(new Event('refresh-notifications'));
    }
    setSaving(false);
  }

  async function handleMarkRead(noteId: number) {
    const res = await markInternalNoteAsRead(noteId, ingresoId);
    if (res.success) {
      await loadNotes();
      onRefresh();
      window.dispatchEvent(new Event('refresh-notifications'));
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(14, 165, 233, 0.05)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
            <FileText size={24} color="var(--primary)" />
            NOTAS INTERNAS
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        {/* History List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--table-sticky-bg)' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader2 className="spin" size={24} color="var(--primary)" />
            </div>
          ) : notes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', margin: '2rem 0' }}>
              No hay notas internas para este ingreso.
            </p>
          ) : (
            notes.map((note) => (
              <div key={note.id} style={{
                background: note.status === 'unread' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(14, 165, 233, 0.05)',
                border: `1px solid ${note.status === 'unread' ? 'rgba(245, 158, 11, 0.3)' : 'var(--glass-border)'}`,
                borderRadius: '12px',
                padding: '1rem',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <span>{note.created_by || 'Usuario'}</span>
                  <span>{format(new Date(note.created_at), "dd/MM/yyyy HH:mm")}</span>
                </div>
                
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {note.note}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  {note.status === 'unread' ? (
                    <button 
                      onClick={() => handleMarkRead(note.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', borderRadius: '6px', background: '#10B981', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      <Check size={14} /> Marcar Leída
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>
                      <Check size={14} /> Leída por {note.read_by} ({note.read_at ? format(new Date(note.read_at), "dd/MM HH:mm") : ''})
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Escribe una nueva nota..."
              style={{
                flex: 1, minHeight: '60px', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--glass-border)',
                background: 'var(--table-sticky-bg)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none',
                resize: 'none', lineHeight: 1.4
              }}
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || saving}
              className="btn-primary"
              style={{ padding: '0 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {saving ? <Loader2 className="spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
