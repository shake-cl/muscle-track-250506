import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = '', id, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`bg-[#252535] border border-[#2d2d40] text-[#f8fafc] rounded-xl px-3 py-2 text-sm
          placeholder:text-[#94a3b8]/50 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]/30
          transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
