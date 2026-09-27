import * as React from "react"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export type Platform = "LeetCode" | "GeeksforGeeks" | "CodeChef"

interface PracticeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  platform: Platform
}

export function PracticeLink({ platform, className, href = "#", ...props }: PracticeLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground border",
        className
      )}
      {...props}
    >
      <span>{platform}</span>
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}
