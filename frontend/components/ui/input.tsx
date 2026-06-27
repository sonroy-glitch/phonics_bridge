import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-xl px-4 py-2.5 text-sm font-medium",
          "transition-all duration-200 outline-none",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-[#9ca3af]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          background: '#fffaf4',
          border: '1.5px solid #ece7df',
          color: '#1f2937',
          fontFamily: 'Inter, sans-serif',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#0d9488';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.12)';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '#ece7df';
          e.currentTarget.style.boxShadow = 'none';
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
