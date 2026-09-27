"use client"

import * as React from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onToggle"> {
  isBookmarked?: boolean
  onToggleBookmark?: (isBookmarked: boolean) => void
}

export function BookmarkButton({ 
  isBookmarked = false, 
  onToggleBookmark, 
  className, 
  ...props 
}: BookmarkButtonProps) {
  return (
    <Button
      variant="icon"
      size="icon"
      className={cn("h-8 w-8 text-muted-foreground hover:text-primary", className)}
      onClick={() => onToggleBookmark?.(!isBookmarked)}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      {...props}
    >
      <Bookmark 
        className={cn("h-4 w-4", isBookmarked && "fill-primary text-primary")} 
      />
    </Button>
  )
}
