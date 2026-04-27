import React from 'react';

export function IngresosIcon({ size = 20, color = 'currentColor' }: { size?: number, color?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
      <path d="M7 16h2v2H7z" /> {/* Placeholder for a cross or small detail */}
      <line x1="19" y1="9" x2="19" y2="15" />
      <line x1="16" y1="12" x2="22" y2="12" />
    </svg>
  );
}
