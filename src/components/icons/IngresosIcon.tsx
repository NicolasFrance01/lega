import React from 'react';

export function IngresosIcon({ size = 20, color = 'currentColor', ...props }: React.SVGProps<SVGSVGElement> & { size?: number, color?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      {/* A door with an arrow pointing inside, representing 'Ingreso' */}
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}
