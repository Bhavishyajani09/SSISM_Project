import React from 'react';

/**
 * A consistent, premium loader component that matches the application UI.
 * @param {('xs'|'sm'|'md'|'lg'|'xl')} size - The size of the spinner.
 * @param {('brand'|'white'|'orange'|'slate')} color - The color scheme of the spinner.
 * @param {string} className - Additional CSS classes.
 */
export default function Loader({ size = 'md', color = 'brand', className = '' }) {
  const sizes = {
    xs: 'w-3 h-3 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
    xl: 'w-12 h-12 border-[4px]',
  };

  const colors = {
    brand: 'border-brand-500/20 border-t-brand-500',
    white: 'border-white/30 border-t-white',
    orange: 'border-orange-500/20 border-t-orange-500',
    slate: 'border-slate-500/20 border-t-slate-500',
  };

  return (
    <div 
      className={`rounded-full animate-spin transition-all ${sizes[size]} ${colors[color]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
