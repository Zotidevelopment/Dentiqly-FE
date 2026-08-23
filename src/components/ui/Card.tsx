import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  style?: React.CSSProperties
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  style
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden ${className}`}
      style={style}
    >
      {(title || subtitle) && (
        <div className={`px-6 py-4 border-b border-[#E5E7EB]`}>
          {title && (
            <h3 className={`text-lg font-semibold text-[#0A0F2D]`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-sm text-[#4B5563] mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-[#E5E7EB] ${className}`}>{children}</div>
)

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-[#0A0F2D] ${className}`}>{children}</h3>
)

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-[#4B5563] mt-1 ${className}`}>{children}</p>
)

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
)