import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-[var(--color-teal-600)] text-white shadow-md hover:bg-[var(--color-teal-700)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]",
        destructive:
          "rounded-full bg-[var(--destructive)] text-white shadow-md hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5",
        outline:
          "rounded-full border-2 border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)] hover:border-[var(--color-teal-400)] hover:text-[var(--color-teal-700)] hover:-translate-y-0.5",
        secondary:
          "rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--color-cream-dark)] hover:-translate-y-0.5",
        ghost:
          "rounded-xl hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
        link:
          "text-[var(--primary)] underline-offset-4 hover:underline rounded-none",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-full px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
