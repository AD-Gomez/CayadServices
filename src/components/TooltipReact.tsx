import React, { useId } from 'react';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  label: string;
  position?: TooltipPosition;
  className?: string;
  id?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const positionMap: Record<TooltipPosition, { panel: string; caret: string }> = {
  top: {
    panel: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    caret: 'top-full left-1/2 -translate-x-1/2 -mt-1',
  },
  bottom: {
    panel: 'top-full left-1/2 -translate-x-1/2 mt-2',
    caret: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
  },
  right: {
    panel: 'left-full top-1/2 -translate-y-1/2 ml-2',
    caret: 'right-full top-1/2 -translate-y-1/2 -mr-1',
  },
  left: {
    panel: 'right-full top-1/2 -translate-y-1/2 mr-2',
    caret: 'left-full top-1/2 -translate-y-1/2 -ml-1',
  },
};

export default function Tooltip({ label, position = 'top', className = '', id, fullWidth = false, children }: TooltipProps) {
  const reactId = useId();
  const tooltipId = id ?? `tt-${reactId}`;
  const pos = positionMap[position];

  return (
    <span className={`relative ${fullWidth ? 'block w-full' : 'inline-flex items-center'} group ${className}`}>
      {children ? (
        <span aria-describedby={tooltipId} className={`${fullWidth ? 'block w-full' : 'inline-flex items-center'} focus:outline-none focus:ring-2 focus:ring-sky-500 rounded cursor-help`}>
          {children}
        </span>
      ) : (
        <button aria-describedby={tooltipId} type="button" className="inline-flex items-center justify-center w-4 h-4 rounded-full text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-help" title="More info" aria-label="More info">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 7a1 1 0 102 0 1 1 0 00-2 0zm-1 3a1 1 0 011-1h1a1 1 0 011 1v3h1a1 1 0 110 2H9a1 1 0 110-2h1v-2H9a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      <div
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute z-[999] whitespace-normal break-words text-left max-w-[calc(100vw-2rem)] md:max-w-xs rounded-md bg-slate-900 text-white text-xs font-medium px-3 py-2 shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 transition duration-150 ${pos.panel}`}
      >
        {label}
        <span className={`absolute w-[6px] h-[6px] bg-slate-900 rotate-45 ${pos.caret}`}></span>
      </div>
    </span>
  );
}
