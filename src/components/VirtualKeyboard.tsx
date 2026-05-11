"use client";

import { useState } from "react";

const QWERTY: string[][] = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

const NUMPAD_ROWS: string[][] = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['-','.','@','/','_','(',')','+','#','%'],
];

interface Props {
  mode: 'numeric' | 'text';
  onKey: (key: string) => void;
  onClose: () => void;
}

export default function VirtualKeyboard({ mode, onKey, onClose }: Props) {
  const [shift, setShift] = useState(true);
  const [numMode, setNumMode] = useState(false);

  const keyBtn = (label: string, onClick: () => void, extra?: React.CSSProperties) => (
    <button
      key={label}
      onPointerDown={(e) => { e.preventDefault(); onClick(); }}
      style={{
        padding: '0 0.25rem',
        height: '62px',
        minWidth: '46px',
        flex: 1,
        fontSize: '1.15rem',
        fontWeight: 700,
        background: '#f1f5f9',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        cursor: 'pointer',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transition: 'background 0.08s',
        ...extra,
      }}
    >
      {label}
    </button>
  );

  if (mode === 'numeric') {
    return (
      <div style={wrapStyle}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.6rem' }}>
          <button onPointerDown={(e) => { e.preventDefault(); onClose(); }} style={closeBtnStyle}>
            ✕ Cerrar teclado
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', maxWidth: '340px', margin: '0 auto' }}>
          {['1','2','3','4','5','6','7','8','9'].map(k =>
            <button key={k} onPointerDown={(e) => { e.preventDefault(); onKey(k); }} style={numBtnStyle}>{k}</button>
          )}
          <button onPointerDown={(e) => { e.preventDefault(); onKey('BACKSPACE'); }} style={{ ...numBtnStyle, background: '#fee2e2', color: '#dc2626', fontSize: '1.5rem' }}>⌫</button>
          <button onPointerDown={(e) => { e.preventDefault(); onKey('0'); }} style={numBtnStyle}>0</button>
          <button onPointerDown={(e) => { e.preventDefault(); onClose(); }} style={{ ...numBtnStyle, background: '#0EA5E9', color: 'white' }}>✓</button>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <button
          onPointerDown={(e) => { e.preventDefault(); setNumMode(v => !v); }}
          style={{ ...closeBtnStyle, background: '#e2e8f0', color: '#1e293b' }}
        >
          {numMode ? '⌨ ABC' : '⌨ 123'}
        </button>
        <button onPointerDown={(e) => { e.preventDefault(); onClose(); }} style={closeBtnStyle}>
          ✕ Cerrar teclado
        </button>
      </div>

      {numMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {NUMPAD_ROWS.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: '0.4rem' }}>
              {row.map(k => keyBtn(k, () => onKey(k)))}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {keyBtn('⌫', () => onKey('BACKSPACE'), { flex: '0 0 70px', background: '#fee2e2', color: '#dc2626', minWidth: '70px' })}
            {keyBtn('ESPACIO', () => onKey(' '), { flex: 3 })}
            {keyBtn('✓ OK', () => onClose(), { flex: '0 0 80px', background: '#0EA5E9', color: 'white', minWidth: '80px' })}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {QWERTY.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
              {ri === 2 && keyBtn(shift ? '⬆ MAY' : '⬇ min', () => setShift(v => !v), {
                flex: '0 0 84px', minWidth: '84px',
                background: shift ? '#0EA5E9' : '#f1f5f9',
                color: shift ? 'white' : '#1e293b',
              })}
              {row.map(k => keyBtn(shift ? k : k.toLowerCase(), () => onKey(shift ? k : k.toLowerCase())))}
              {ri === 2 && keyBtn('⌫', () => onKey('BACKSPACE'), { flex: '0 0 64px', minWidth: '64px', background: '#fee2e2', color: '#dc2626' })}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {keyBtn('⌫', () => onKey('BACKSPACE'), { flex: '0 0 60px', background: '#fee2e2', color: '#dc2626', minWidth: '60px' })}
            {keyBtn('ESPACIO', () => onKey(' '), { flex: 4 })}
            {keyBtn('.', () => onKey('.'), { flex: '0 0 46px', minWidth: '46px' })}
            {keyBtn('✓ OK', () => onClose(), { flex: '0 0 80px', background: '#0EA5E9', color: 'white', minWidth: '80px' })}
          </div>
        </div>
      )}
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'white',
  borderTop: '3px solid #0EA5E9',
  padding: '0.85rem 1rem 1.25rem',
  zIndex: 9000,
  boxShadow: '0 -10px 40px rgba(0,0,0,0.18)',
};

const numBtnStyle: React.CSSProperties = {
  height: '72px',
  fontSize: '1.8rem',
  fontWeight: 800,
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  cursor: 'pointer',
  color: '#1e293b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

const closeBtnStyle: React.CSSProperties = {
  padding: '0.45rem 1rem',
  borderRadius: '8px',
  border: 'none',
  background: '#fee2e2',
  color: '#dc2626',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '0.85rem',
};
