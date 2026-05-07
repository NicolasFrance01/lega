"use client";

import { useState, useEffect, useRef } from "react";
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
  defaultValue = "",
  listId,
  className,
  style,
  placeholder = "Seleccioná o escribí obra social...",
  required = false,
}: Props) {
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(defaultValue || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCustomObrasSociales().then(r => {
      if (r.data?.length) setCustomOptions(r.data);
    });
  }, []);

  // Sync when parent changes defaultValue (e.g. patient selection)
  useEffect(() => {
    setInputValue(defaultValue || "");
  }, [defaultValue]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowAdd(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const allOptions = Array.from(new Set([...BASE_OPTIONS, ...customOptions])).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  const filteredOptions = inputValue.trim()
    ? allOptions.filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase()))
    : allOptions;

  function selectOption(opt: string) {
    setInputValue(opt);
    setShowDropdown(false);
    setHighlightIdx(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) { if (e.key === 'ArrowDown') setShowDropdown(true); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightIdx >= 0 && filteredOptions[highlightIdx]) {
        e.preventDefault();
        selectOption(filteredOptions[highlightIdx]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.children[highlightIdx] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSaving(true);
    await addCustomObraSocial(trimmed);
    const upper = trimmed.toUpperCase();
    setCustomOptions(prev => [...prev, upper]);
    setInputValue(upper);
    setNewName("");
    setShowAdd(false);
    setShowDropdown(false);
    setSaving(false);
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <input
          type="text"
          name={name}
          value={inputValue}
          onChange={e => { setInputValue(e.target.value); setShowDropdown(true); setHighlightIdx(-1); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className={className}
          style={{ ...style, flex: 1, minWidth: 0 }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => { setShowAdd(v => !v); setShowDropdown(false); }}
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

      {/* Autocomplete dropdown */}
      {showDropdown && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 3px)',
            left: 0,
            right: 0,
            zIndex: 500,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {filteredOptions.map((opt, idx) => (
            <div
              key={opt}
              onMouseDown={e => { e.preventDefault(); selectOption(opt); }}
              style={{
                padding: '0.5rem 0.85rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                background: idx === highlightIdx ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                borderBottom: idx < filteredOptions.length - 1 ? '1px solid var(--glass-border)' : 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={() => setHighlightIdx(idx)}
              onMouseLeave={() => setHighlightIdx(-1)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      {/* Add new panel */}
      {showAdd && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 500,
          background: 'var(--glass-bg)',
          border: '1px solid var(--primary)',
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
              if (e.key === 'Escape') { setShowAdd(false); setNewName(""); }
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
    </div>
  );
}
