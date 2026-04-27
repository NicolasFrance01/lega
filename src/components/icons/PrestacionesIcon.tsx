import React from 'react';

export const PrestacionesIcon = ({ size = 20, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Simple Hand Palm */}
    <path d="M3 11c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2a8 8 0 0 1-8 8H7a4 4 0 0 1-4-4v-6z" />
    <path d="M19 11l2.5 2.5a2 2 0 0 1 0 2.8l-2.5 2.5" />
    
    {/* Circle 1: Heart (Health) */}
    <circle cx="6" cy="5" r="3" />
    <path d="M6 6s.5-.5.5-1-.5-1-1-1-1 .5-1 1 .5 1 .5 1z" strokeWidth="1" />
    
    {/* Circle 2: Plus (Medical) */}
    <circle cx="18" cy="5" r="3" />
    <path d="M18 4v2M17 5h2" strokeWidth="1" />
    
    {/* Circle 3: Percent (Formulas/Pricing) */}
    <circle cx="12" cy="8" r="3.5" />
    <path d="M11 9l2-2M11 7h.01M13 9h.01" strokeWidth="1" />
  </svg>
);
