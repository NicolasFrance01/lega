"use client";

import { useState, useEffect, useRef } from "react";
import { getProfesionales, createProfesional } from "@/actions/listados";
import { Plus, Loader2, X } from "lucide-react";

interface Props {
  name?: string;
  defaultValue?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  required?: boolean;
}

export default function ProfesionalInput({
  name = "professional_name",
  defaultValue = "",
  className,
  style,
  placeholder,
}: Props) {
  const parseValue = (v: string) =>
    v ? v.split(',').map(s => s.trim()).filter(Boolean) : [];

  const [selected, setSelected] = useState<string[]>(parseValue(defaultValue));
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [options, setOptions] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProfesionales().then(res => {
      if (res.data) {
        setOptions(res.data.filter((o: any) => o.activo).map((o: any) => o.nombre));
      }
    });
  }, []);

  useEffect(() => {
    setSelected(parseValue(defaultValue));
  }, [defaultValue]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (highlightIdx >= 0 && dropdownRef.current) {
      (dropdownRef.current.children[highlightIdx] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  const filteredOptions = options.filter(opt =>
    !selected.includes(opt) &&
    (inputValue.trim() === '' || opt.toLowerCase().includes(inputValue.toLowerCase()))
  );

  function add(opt: string) {
    const trimmed = opt.trim();
    if (trimmed && !selected.includes(trimmed)) {
      setSelected(prev => [...prev, trimmed]);
    }
    setInputValue("");
    setShowDropdown(false);
    setHighlightIdx(-1);
  }

  function remove(opt: string) {
    setSelected(prev => prev.filter(o => o !== opt));
  }

  async function handleAddNew() {
    if (!inputValue.trim() || isAdding) return;
    setIsAdding(true);
    const nombre = inputValue.trim().toUpperCase();
    const res = await createProfesional(nombre);
    setIsAdding(false);
    if (res.success) {
      setOptions(prev => [...prev, nombre].sort());
      add(nombre);
    } else {
      alert(res.error || "Error al agregar profesional");
    }
  }

  const exactMatch = options.some(o => o.toLowerCase() === inputValue.trim().toLowerCase());
  const showAddOption = inputValue.trim() !== '' && !exactMatch;
  const totalOptionsCount = filteredOptions.length + (showAddOption ? 1 : 0);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0) {
        if (showAddOption && highlightIdx === filteredOptions.length) {
          handleAddNew();
        } else if (filteredOptions[highlightIdx]) {
          add(filteredOptions[highlightIdx]);
        }
      } else if (showAddOption) {
        handleAddNew();
      } else if (inputValue.trim()) {
        add(inputValue.trim());
      } else {
        setShowDropdown(false);
      }
      return;
    }
    if (!showDropdown) { if (e.key === 'ArrowDown') setShowDropdown(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, totalOptionsCount - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Escape') { setShowDropdown(false); }
    else if (e.key === 'Backspace' && inputValue === '' && selected.length > 0) {
      setSelected(prev => prev.slice(0, -1));
    }
  }

  const joinedValue = selected.join(', ');

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input type="hidden" name={name} value={joinedValue} />

      <div
        onClick={() => { setShowDropdown(true); (containerRef.current?.querySelector('input[type=text]') as HTMLInputElement)?.focus(); }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.35rem',
          alignItems: 'center',
          padding: '0.4rem 0.6rem',
          background: style?.background ?? 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          cursor: 'text',
          minHeight: '42px',
          ...(className ? {} : style),
        }}
        className={className}
      >
        {selected.map(opt => (
          <span
            key={opt}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: 'rgba(14, 165, 233, 0.15)',
              color: 'var(--primary)',
              border: '1px solid rgba(14, 165, 233, 0.35)',
              borderRadius: '20px',
              padding: '0.15rem 0.55rem 0.15rem 0.65rem',
              fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap',
            }}
          >
            {opt}
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); remove(opt); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}
            >
              <X size={11} />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={e => { setInputValue(e.target.value); setShowDropdown(true); setHighlightIdx(-1); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? (placeholder ?? 'Nombre del médico...') : 'Agregar otro...'}
          autoComplete="off"
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            flex: 1,
            minWidth: '140px',
            padding: '0.2rem 0',
          }}
        />
      </div>

      {showDropdown && (filteredOptions.length > 0 || showAddOption) && (
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
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {filteredOptions.map((opt, idx) => (
            <div
              key={opt}
              onMouseDown={e => { e.preventDefault(); add(opt); }}
              onMouseEnter={() => setHighlightIdx(idx)}
              onMouseLeave={() => setHighlightIdx(-1)}
              style={{
                padding: '0.5rem 0.85rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                background: idx === highlightIdx ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                borderBottom: (idx < filteredOptions.length - 1 || showAddOption) ? '1px solid var(--glass-border)' : 'none',
                transition: 'background 0.1s',
              }}
            >
              {opt}
            </div>
          ))}
          {showAddOption && (
            <div
              onMouseDown={e => { e.preventDefault(); handleAddNew(); }}
              onMouseEnter={() => setHighlightIdx(filteredOptions.length)}
              onMouseLeave={() => setHighlightIdx(-1)}
              style={{
                padding: '0.6rem 0.85rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--primary)',
                background: highlightIdx === filteredOptions.length ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background 0.1s',
              }}
            >
              {isAdding ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
              {isAdding ? 'Agregando...' : `Agregar "${inputValue.toUpperCase()}"`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
