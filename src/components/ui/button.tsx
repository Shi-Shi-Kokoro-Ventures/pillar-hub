
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-2 focus:ring-destructive focus:ring-offset-2",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground focus:bg-purple-100 focus:text-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-400",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-2 focus:ring-secondary focus:ring-offset-2",
        ghost: "hover:bg-accent hover:text-accent-foreground focus:bg-accent/80 focus:text-accent-foreground focus:ring-1 focus:ring-accent",
        link: "text-primary underline-offset-4 hover:underline focus:text-primary/80 focus:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 py-1.5 text-xs",
        lg: "h-11 rounded-md px-6 text-base",
        icon: "h-10 w-10",
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
