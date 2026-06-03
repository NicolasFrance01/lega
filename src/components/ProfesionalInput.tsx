"use client";

import { useState, useEffect, useRef } from "react";
import { getProfesionales } from "@/actions/listados";

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
  const [inputValue, setInputValue] = useState(defaultValue || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [options, setOptions] = useState<string[]>([]);
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
    setInputValue(defaultValue || "");
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
    (inputValue.trim() === '' || opt.toLowerCase().includes(inputValue.toLowerCase()))
  );

  function selectOpt(opt: string) {
    setInputValue(opt);
    setShowDropdown(false);
    setHighlightIdx(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && filteredOptions[highlightIdx]) {
        selectOpt(filteredOptions[highlightIdx]);
      } else {
        setShowDropdown(false);
      }
      return;
    }
    if (!showDropdown) { if (e.key === 'ArrowDown') setShowDropdown(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, filteredOptions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Escape') { setShowDropdown(false); }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        name={name}
        type="text"
        value={inputValue}
        onChange={e => { setInputValue(e.target.value); setShowDropdown(true); setHighlightIdx(-1); }}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Nombre del médico..."}
        autoComplete="off"
        className={className}
        style={style}
      />

      {showDropdown && filteredOptions.length > 0 && (
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
              onMouseDown={e => { e.preventDefault(); selectOpt(opt); }}
              onMouseEnter={() => setHighlightIdx(idx)}
              onMouseLeave={() => setHighlightIdx(-1)}
              style={{
                padding: '0.5rem 0.85rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                background: idx === highlightIdx ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                borderBottom: idx < filteredOptions.length - 1 ? '1px solid var(--glass-border)' : 'none',
                transition: 'background 0.1s',
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
