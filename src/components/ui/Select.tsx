import React from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className={`block text-sm font-medium text-[#374151] mb-1`}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full px-3 py-2 border rounded-lg appearance-none transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#2563FF)] focus:border-transparent ${
            error 
              ? `border-[#EF4444]` 
              : `border-[#D1D5DB] hover:border-[#9CA3AF]`
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none`} />
      </div>
      {error && (
        <p className={`mt-1 text-sm text-[#EF4444]`}>{error}</p>
      )}
    </div>
  )
}