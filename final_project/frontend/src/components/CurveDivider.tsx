import React from 'react';

export default function CurveDivider({ 
  className = "bg-white dark:bg-slate-950",
  fillClassName = "fill-white dark:fill-slate-950" 
}: { 
  className?: string; 
  fillClassName?: string;
}) {
  return (
    <div className={`w-full overflow-hidden leading-[0] transition-colors ${className}`}>
      <svg 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none" 
        className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px]"
      >
        <path 
          d="M0,60 C150,110 450,10 600,60 C750,110 1050,10 1200,60 V120 H0 Z" 
          className={`${fillClassName} transition-colors`}
        />
        <path 
          d="M0,60 C150,110 450,10 600,60 C750,110 1050,10 1200,60" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="8"
          className="text-mango"
        />
      </svg>
    </div>
  );
}
