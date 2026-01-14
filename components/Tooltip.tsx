import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'bottom' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Generate a unique ID for aria-describedby
  const tooltipId = `tooltip-${React.useId()}`;

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {React.cloneElement(children, {
        'aria-describedby': isVisible ? tooltipId : undefined,
      } as any)}
      
      {isVisible && (
        <div 
          className={`absolute ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 -translate-x-1/2 z-50 pointer-events-none`}
        >
          <div 
            id={tooltipId}
            role="tooltip"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 rounded-lg shadow-xl whitespace-nowrap animate-fade-in relative"
          >
            {content}
            <div className={`absolute ${position === 'bottom' ? 'bottom-full border-b-slate-800' : 'top-full border-t-slate-800'} left-1/2 -translate-x-1/2 border-4 border-transparent`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;