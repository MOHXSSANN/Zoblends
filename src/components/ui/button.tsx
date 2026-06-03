import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#d4af37] text-black shadow-sm hover:bg-[#c49e2a]",
        outline: "border border-[rgba(212,175,55,0.25)] bg-transparent text-[rgba(245,244,240,0.7)] hover:bg-[rgba(212,175,55,0.08)] hover:text-[#d4af37]",
        ghost: "hover:bg-[rgba(212,175,55,0.08)] hover:text-[#d4af37] text-[rgba(245,244,240,0.5)]",
        selected: "bg-[#d4af37] text-black font-semibold",
        taken: "border border-[rgba(245,244,240,0.05)] bg-transparent text-[rgba(245,244,240,0.15)] cursor-not-allowed line-through",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
