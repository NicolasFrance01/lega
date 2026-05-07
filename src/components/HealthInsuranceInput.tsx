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

function OptionList({
  options,
  highlightIdx,
  onSelect,
  onHighlight,
  dropdownRef,
}: {
  options: string[];
  highlightIdx: number;
  onSelect: (opt: string) => void;
  onHighlight: (idx: number) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (options.length === 0) return null;
  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 3px)',
        left: 0,
        right: 0,
        zIndex: 600,
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        maxHeight: '200px',
        overflowY: 'auto',
      }}
    >
      {options.map((opt, idx) => (
        <div
          key={opt}
          onMouseDown={e => { e.preventDefault(); onSelect(opt); }}
          onMouseEnter={() => onHighlight(idx)}
          onMouseLeave={() => onHighlight(-1)}
          style={{
            padding: '0.5rem 0.85rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
            background: idx === highlightIdx ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
            borderBottom: idx < options.length - 1 ? '1px solid var(--glass-border)' : 'none',
            transition: 'background 0.1s',
          }}
        >
          {opt}
        </div>
      ))}
    </div>
  );
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
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [addDropdown, setAddDropdown] = useState(false);
  const [addHighlightIdx, setAddHighlightIdx] = useState(-1);
  const [saving, setSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mainDropdownRef = useRef<HTMLDivElement>(null);
  const addDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCustomObrasSociales().then(r => {
      if (r.data?.length) setCustomOptions(r.data);
    });
  }, []);

  useEffect(() => {
    setInputValue(defaultValue || "");
  }, [defaultValue]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowAdd(false);
        setAddDropdown(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const allOptions = Array.from(new Set([...BASE_OPTIONS, ...customOptions])).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  const mainFiltered = inputValue.trim()
    ? allOptions.filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase()))
    : allOptions;

  const addFiltered = newName.trim()
    ? allOptions.filter(opt => opt.toLowerCase().includes(newName.toLowerCase()))
    : allOptions;

  // Scroll highlighted items into view
  useEffect(() => {
    if (highlightIdx >= 0 && mainDropdownRef.current) {
      (mainDropdownRef.current.children[highlightIdx] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  useEffect(() => {
    if (addHighlightIdx >= 0 && addDropdownRef.current) {
      (addDropdownRef.current.children[addHighlightIdx] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
    }
  }, [addHighlightIdx]);

  function selectMain(opt: string) {
    setInputValue(opt);
    setShowDropdown(false);
    setHighlightIdx(-1);
  }

  // Selecting from the add-panel dropdown fills the main field (existing option chosen)
  function selectFromAddPanel(opt: string) {
    setInputValue(opt);
    setShowAdd(false);
    setAddDropdown(false);
    setNewName("");
    setAddHighlightIdx(-1);
  }

  function handleMainKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) { if (e.key === 'ArrowDown') setShowDropdown(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, mainFiltered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') {
      if (highlightIdx >= 0 && mainFiltered[highlightIdx]) { e.preventDefault(); selectMain(mainFiltered[highlightIdx]); }
    } else if (e.key === 'Escape') { setShowDropdown(false); }
  }

  function handleAddKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { setShowAdd(false); setNewName(""); setAddDropdown(false); return; }
    if (!addDropdown) { if (e.key === 'ArrowDown') { setAddDropdown(true); return; } }
    if (e.key === 'ArrowDown') { e.preventDefault(); setAddHighlightIdx(i => Math.min(i + 1, addFiltered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAddHighlightIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') {
      if (addHighlightIdx >= 0 && addFiltered[addHighlightIdx]) { e.preventDefault(); selectFromAddPanel(addFiltered[addHighlightIdx]); }
      else { e.preventDefault(); handleAdd(); }
    }
  }

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
    setAddDropdown(false);
    setShowDropdown(false);
    setSaving(false);
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Main input row */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <input
          type="text"
          name={name}
          value={inputValue}
          onChange={e => { setInputValue(e.target.value); setShowDropdown(true); setHighlightIdx(-1); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleMainKeyDown}
          className={className}
          style={{ ...style, flex: 1, minWidth: 0 }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => { setShowAdd(v => !v); setShowDropdown(false); setNewName(""); setAddDropdown(false); }}
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

      {/* Main autocomplete dropdown */}
      {showDropdown && !showAdd && (
        <OptionList
          options={mainFiltered}
          highlightIdx={highlightIdx}
          onSelect={selectMain}
          onHighlight={setHighlightIdx}
          dropdownRef={mainDropdownRef}
        />
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
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Add-panel input with its own autocomplete */}
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={newName}
                onChange={e => { setNewName(e.target.value); setAddDropdown(true); setAddHighlightIdx(-1); }}
                onFocus={() => setAddDropdown(true)}
                onKeyDown={handleAddKeyDown}
                placeholder="Escribí para buscar o agregar nueva..."
                autoFocus
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '0.4rem 0.75rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              {/* Add-panel dropdown */}
              {addDropdown && (
                <OptionList
                  options={addFiltered}
                  highlightIdx={addHighlightIdx}
                  onSelect={selectFromAddPanel}
                  onHighlight={setAddHighlightIdx}
                  dropdownRef={addDropdownRef}
                />
              )}
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || !newName.trim()}
              title="Guardar como nueva obra social"
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
                flexShrink: 0,
              }}
            >
              <Check size={12} /> Guardar nueva
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setNewName(""); setAddDropdown(false); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
