"use client";

import { useState, useEffect } from "react";
import { Plus, Check, X } from "lucide-react";
import { getCustomObrasSociales, addCustomObraSocial } from "@/actions/healthInsurance";

const BASE_OPTIONS = [
  'Particular', 'A.A.T.R.A. - OSTYR - (SCIS S.A. )', 'A.M.U.R.', 'A.P.M.', 'ALCAT',
  'APROSS', 'AVALIAN', 'CAJA DE ABOGADOS', 'CAJA NOTARIAL', 'CEA - SAN PEDRO',
  'CIENCIAS ECONOMICAS', 'CIBIC', 'COBERTURA DE SALUD S.A. (BOREAL)', 'D.A.S.P.U.',
  'DA.SU.Te.N', 'Derivacion', 'FEDERADA SALUD', 'Galeno', 'GRUPO PREMEDIC', 'IOSFA',
  'JERARQUICOS SALUD', 'Jujuy', 'LUIS PASTEUR', 'Medife', 'Metabolomica',
  'O.P.D.E.A.', 'O.S.P.E.R.Y.H.R.A.', 'O.S.P.I.A.', 'O.S.P.I.G.P.C.',
  'OBRA SOCIAL PERSONAL DE FARMACIA (O.S.P.F.)', 'OSADEF', 'OSFFENTOS', 'OSMISS',
  'OSPACA', 'OSPCRA', 'OSPECOR', 'OSPEP', 'OSPICAL ENSALUD', 'OSPIHMP', 'OSPIM',
  'OSPJTAP', 'OSPL', 'OSSACRA AMA SALUD', 'OSTEL', 'Osde', 'PAMI', 'PODER JUDICIAL',
  'PREVENCION SALUD', 'Rio 1°', 'S.A.D.A.I.C.', 'S.A.P.', 'SANCOR SALUD',
  'SUPERINTEND.DE BIENESTAR POLICIA FEDERAL ARG.', 'Swiss medical',
  'UNION PERSONAL', 'VETERANOS DE GUERRA',
];

interface Props {
  name?: string;
  defaultValue?: string;
  listId?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  required?: boolean;
}

export default function HealthInsuranceInput({
  name = "health_insurance",
  defaultValue,
  listId = "insurance-list",
  className,
  style,
  placeholder = "Seleccioná o escribí obra social...",
  required = false,
}: Props) {
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCustomObrasSociales().then(r => {
      if (r.data?.length) setCustomOptions(r.data);
    });
  }, []);

  const allOptions = Array.from(new Set([...BASE_OPTIONS, ...customOptions])).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSaving(true);
    await addCustomObraSocial(trimmed);
    const upper = trimmed.toUpperCase();
    setCustomOptions(prev => [...prev, upper]);
    setNewName("");
    setShowAdd(false);
    setSaving(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <input
          name={name}
          type="text"
          list={listId}
          defaultValue={defaultValue}
          className={className}
          style={{ ...style, flex: 1, minWidth: 0 }}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowAdd(v => !v)}
          title="Agregar nueva obra social"
          style={{
            background: showAdd ? 'var(--primary-hover)' : 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      {showAdd && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 200,
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '10px',
          padding: '0.75rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
              if (e.key === 'Escape') setShowAdd(false);
            }}
            placeholder="Nombre de la nueva obra social..."
            autoFocus
            style={{
              flex: 1,
              padding: '0.4rem 0.75rem',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '6px',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            style={{
              background: 'var(--success)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              cursor: saving || !newName.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              opacity: saving || !newName.trim() ? 0.6 : 1,
            }}
          >
            <Check size={12} /> Guardar
          </button>
          <button
            type="button"
            onClick={() => { setShowAdd(false); setNewName(""); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <datalist id={listId}>
        {allOptions.map(opt => <option key={opt} value={opt} />)}
      </datalist>
    </div>
  );
}
