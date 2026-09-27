import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0 to 100
}

export function ProgressBar({ value, className, ...props }: ProgressBarProps) {
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
