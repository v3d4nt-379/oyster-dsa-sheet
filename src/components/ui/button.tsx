import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "icon" | "brand" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
    
    // PRIMARY: Strong but restrained solid accent button.
    let variantClass = "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
    
    // SECONDARY: Neutral/outlined button.
    if (variant === "secondary") variantClass = "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm"
    
    // TERTIARY: Text/ghost action.
    if (variant === "tertiary") variantClass = "hover:bg-accent hover:text-accent-foreground"
    
    // ICON: Minimal utility control.
    if (variant === "icon") variantClass = "hover:bg-accent hover:text-accent-foreground"
    
    // BRAND GRADIENT: Reserved for major brand moments.
    if (variant === "brand") variantClass = "bg-gradient-to-r from-brand-gold via-brand-orange to-brand-pink text-white hover:opacity-90 border-0 shadow-sm"
    
    if (variant === "destructive") variantClass = "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"

    let sizeClass = "h-10 px-4 py-2"
    if (size === "sm") sizeClass = "h-9 rounded-md px-3"
    if (size === "lg") sizeClass = "h-11 rounded-md px-8"
    if (size === "icon" || variant === "icon") sizeClass = "h-10 w-10"

    const baseClass = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"

    return (
      <button
        className={cn(baseClass, variantClass, sizeClass, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
