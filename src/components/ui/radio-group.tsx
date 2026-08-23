import React, { createContext, useContext } from "react"

interface RadioGroupContextValue {
    value: string
    onValueChange: (value: string) => void
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

interface RadioGroupProps {
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
    className?: string
}

export function RadioGroup({ value, onValueChange, children, className = "" }: RadioGroupProps) {
    return (
        <RadioGroupContext.Provider value={{ value, onValueChange }}>
            <div className={`flex flex-col gap-2 ${className}`} role="radiogroup">
                {children}
            </div>
        </RadioGroupContext.Provider>
    )
}

interface RadioGroupItemProps {
    value: string
    id?: string
    className?: string
}

export function RadioGroupItem({ value, id, className = "" }: RadioGroupItemProps) {
    const context = useContext(RadioGroupContext)

    if (!context) {
        console.warn("RadioGroupItem must be used within a RadioGroup")
        return null
    }

    const checked = context.value === value

    return (
        <button
            type="button"
            role="radio"
            aria-checked={checked}
            id={id}
            onClick={() => context.onValueChange(value)}
            className={`
        h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        flex items-center justify-center
        ${checked ? `border-[var(--brand-primary,#2563FF)]` : `border-gray-400`}
        ${className}
      `}
        >
            {checked && (
                <div className={`h-2.5 w-2.5 rounded-full bg-[var(--brand-primary,#2563FF)]`} />
            )}
        </button>
    )
}
