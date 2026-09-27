import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "brand"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let variantClass = "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
  if (variant === "secondary") variantClass = "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
  if (variant === "destructive") variantClass = "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80"
  if (variant === "outline") variantClass = "text-foreground"
  if (variant === "brand") variantClass = "border-transparent bg-gradient-to-r from-brand-gold via-brand-orange to-brand-pink text-white"

  const baseClass = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

  return (
    <div className={cn(baseClass, variantClass, className)} {...props} />
  )
}

export { Badge }
