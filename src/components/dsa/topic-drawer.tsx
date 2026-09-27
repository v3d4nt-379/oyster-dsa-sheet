"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProgressBar } from "@/components/ui/progress"

export interface TopicDrawerProps {
  title: string
  solvedCount: number
  totalCount: number
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
}

export function TopicDrawer({
  title,
  solvedCount,
  totalCount,
  children,
  defaultExpanded = false,
  className
}: TopicDrawerProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
  
  const percentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0

  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full flex-col p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-lg"
        aria-expanded={isExpanded}
      >
        <div className="flex w-full items-center justify-between mb-2">
          <h3 className="font-semibold tracking-tight">{title}</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium whitespace-nowrap">
              {solvedCount} / {totalCount}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground transition-transform" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
            )}
          </div>
        </div>
        <ProgressBar value={percentage} className="w-full" />
      </button>
      
      {isExpanded && (
        <div className="border-t animate-in slide-in-from-top-2 fade-in duration-200 ease-in-out">
          {children}
        </div>
      )}
    </div>
  )
}
