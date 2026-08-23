import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  // El label tiene que quedar asociado al input: sin esto el campo no tiene
  // nombre accesible, los lectores de pantalla lo anuncian vacío y hacer clic
  // en la etiqueta no enfoca el campo.
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className={`block text-sm font-medium text-[#374151] mb-1`}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#2563FF)] focus:border-transparent ${
          error
            ? `border-[#EF4444]`
            : `border-[#D1D5DB] hover:border-[#9CA3AF]`
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className={`mt-1 text-sm text-[#EF4444]`}>{error}</p>
      )}
      {helperText && !error && (
        <p className={`mt-1 text-sm text-[#5C6B7B]`}>{helperText}</p>
      )}
    </div>
  )
}